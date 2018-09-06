import { isBrowser } from 'browser-or-node';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';
import i18next from 'i18next';
import { LedgerAccount, SupportedCoin, DposLedger } from 'dpos-ledger-api';
import isElectron from 'is-electron';
import hwConstants from '../constants/hwConstants';
import { loadingStarted, loadingFinished } from './loading';
import signPrefix from '../constants/signPrefix';
import { infoToastDisplayed } from '../actions/toaster';
import { calculateTxId, getBufferToHex, getTransactionBytes } from './rawTransactionWrapper';
import store from '../store';

export const ledgerMessages = {
  notConnected: i18next.t('Unable to connect to Ledger Nano S. Be sure your device is unlocked and inside the Lisk App'),
  actionDenied: i18next.t('Action Denied by User'),
  confirmation: i18next.t('Look at your Ledger for confirmation'),
  confirmationForPin: i18next.t('Look at your Ledger for confirmation of second signature'),
};

export const getLedgerTransportMethod = () => {
  let transportMethod;
  if (isElectron()) {
    transportMethod = TransportNodeHid;
  } else if (isBrowser) {
    transportMethod = TransportU2F;
  } else {
    transportMethod = TransportNodeHid;
  }
  return transportMethod;
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
  const transportMethod = getLedgerTransportMethod();
  const transport = await transportMethod.create();
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

