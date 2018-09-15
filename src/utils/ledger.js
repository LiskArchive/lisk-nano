import { isBrowser } from 'browser-or-node';
import isElectron from 'is-electron';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import i18next from 'i18next';
import { LedgerAccount, SupportedCoin, DposLedger } from 'dpos-ledger-api';
import hwConstants from '../constants/hwConstants';
import { loadingStarted, loadingFinished } from './loading';
import signPrefix from '../constants/signPrefix';
import { infoToastDisplayed, errorToastDisplayed } from '../actions/toaster';
import { calculateTxId, getBufferToHex, getTransactionBytes } from './rawTransactionWrapper';
import store from '../store';

const { ipc } = window;

export const ledgerMessages = {
  noTransport: i18next.t('Unable to detect the communication layer with your Ledger Nano S'),
  notConnected: i18next.t('Unable to detect your Ledger Nano S. Be sure your device is connected and inside the Lisk App'),
  ledgerConnected: i18next.t('Ledger Nano S Connected.'),
  ledgerDisconnected: i18next.t('Ledger Nano S Disconnected.'),
  actionDenied: i18next.t('Action Denied by User'),
  confirmation: i18next.t('Look at your Ledger for confirmation'),
  confirmationForPin: i18next.t('Look at your Ledger for confirmation of second signature'),
};

if (ipc) { // On browser-mode is undefined
  ipc.on('ledgerConnected', () => {
    store.dispatch(infoToastDisplayed({ label: ledgerMessages.ledgerConnected }));
  });

  ipc.on('ledgerDisconnected', () => {
    store.dispatch(errorToastDisplayed({ label: ledgerMessages.ledgerDisconnected }));
  });
}

class IPCTransport {
  constructor(key) {
    this.key = key;
  }

  static async create() {
    const key = (Math.random() * 10000).toString(16);
    return this.__rawSend('ledger.createTransport', key)
      .then(() => new this(key));
  }

  // eslint-disable-next-line class-methods-use-this
  setScrambleKey(k) {
    ipc.sendSync(`ledger[${this.key}].setScrambleKey`, k);
  }

  // eslint-disable-next-line class-methods-use-this
  send(...args) {
    return IPCTransport.__rawSend(`ledger[${this.key}].send`, ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  static __rawSend(k, ...args) {
    return new Promise((resolve, reject) => {
      ipc.once(`${k}.result`, (event, res) => {
        if (res.success) {
          return resolve(res.data);
        }
        return reject(res.error);
      });
      ipc.send(`${k}.request`, ...args);
    });
  }
}


const throwIfError = (returnValue) => {
  if (returnValue instanceof Error) {
    throw returnValue;
  }
  return returnValue;
};

const getLedgerTransportU2F = async () => TransportU2F.create();

const getLedgerTransport = async () => {
  if (isElectron()) {
    return IPCTransport.create();
  } else if (isBrowser) {
    return getLedgerTransportU2F();
  }
  return new Error(ledgerMessages.noTransport);
};

export const getLedgerAccount = (index = 0) => {
  const ledgerAccount = new LedgerAccount();
  ledgerAccount.coinIndex(SupportedCoin.LISK);
  ledgerAccount.account(index);
  return ledgerAccount;
};

export const calculateSecondPassphraseIndex =
  (accountIndex, pin) => accountIndex + parseInt(pin, 10) + hwConstants.secondPassphraseOffset;

export const getLiskDposLedger = async () => {
  const transport = throwIfError(await getLedgerTransport());
  return new DposLedger(transport);
};

export const signMessageWithLedger = async (account, message) => {
  const liskLedger = await getLiskDposLedger();
  const ledgerAccount = getLedgerAccount(account.hwInfo.derivationIndex);

  store.dispatch(infoToastDisplayed({ label: ledgerMessages.confirmation }));

  try {
    const messageToSign = signPrefix + message;
    const signature = await liskLedger.signMSG(ledgerAccount, messageToSign);
    return getBufferToHex(signature.slice(0, 64));
  } catch (e) {
    throw new Error(ledgerMessages.notConnected);
  }
};

export const getPublicKeyFromLedgerIndex = async (index = 0) => {
  try {
    const liskLedger = await getLiskDposLedger();
    const ledgerAccount = getLedgerAccount(index);
    const getResult = await liskLedger.getPubKey(ledgerAccount);
    return getResult.publicKey;
  } catch (e) {
    throw new Error(ledgerMessages.notConnected);
  }
};

/* eslint-disable prefer-const */
export const signTransactionWithLedger = async (tx, account, pin) => {
  const liskLedger = await getLiskDposLedger();
  const ledgerAccount = getLedgerAccount(account.hwInfo.derivationIndex);

  loadingStarted('ledgerUserAction');
  store.dispatch(infoToastDisplayed({ label: ledgerMessages.confirmation }));

  let signature;
  try {
    signature = await liskLedger.signTX(ledgerAccount, getTransactionBytes(tx), false);
  } catch (err) {
    loadingFinished('ledgerUserAction');
    if (err.statusText && err.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED') {
      throw new Error(ledgerMessages.actionDenied);
    } else {
      throw new Error(ledgerMessages.notConnected);
    }
  }
  tx.signature = getBufferToHex(signature);
  loadingFinished('ledgerUserAction');

  if (typeof pin === 'string' && pin !== '') {
    loadingStarted('ledgerUserAction');
    store.dispatch(infoToastDisplayed({ label: ledgerMessages.confirmationForPin }));
    const ledgerAccountSecondPassphrase =
      getLedgerAccount(calculateSecondPassphraseIndex(account.hwInfo.derivationIndex, pin));

    let signSignature;
    try {
      signSignature =
        await liskLedger.signTX(ledgerAccountSecondPassphrase, getTransactionBytes(tx), false);
    } catch (err) {
      loadingFinished('ledgerUserAction');
      throw new Error(ledgerMessages.actionDenied);
    }
    tx.signSignature = getBufferToHex(signSignature);
    loadingFinished('ledgerUserAction');
  }
  tx.id = calculateTxId(tx);
  return tx;
};

