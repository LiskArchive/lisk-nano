import 'babel-polyfill';
import {
  createSendTX,
  createDelegateTX,
  createSecondPassphraseTX,
  createRawVoteTX,
} from '../rawTransactionWrapper';
import {
  calculateSecondPassphraseIndex,
  getLedgerAccount,
  signTransactionWithLedger,
  getPublicKeyFromLedgerIndex,
  getLiskDposLedger,
} from '../ledger';
import to from '../to';
import { getAccount, transactions as getTransactions } from './account';
import { listAccountDelegates as getVotes } from './delegate';

/**
 * Trigger this action to sign and broadcast a SendTX with Ledger Account
 * NOTE: secondPassphrase for ledger is a PIN (numeric)
 * @returns Promise - Action Send with Ledger
 */
/* eslint-disable prefer-const */
export const sendWithLedger = (activePeer, account, recipientId, amount,
  pin = null, data = null) =>
  new Promise(async (resolve, reject) => {
    const rawTx = createSendTX(account.publicKey, recipientId, amount, data);
    let error;
    let signedTx;
    [error, signedTx] = await to(signTransactionWithLedger(rawTx, account, pin));
    if (error) {
      reject(error);
    } else {
      activePeer.transactions.broadcast(signedTx).then(() => {
        resolve(signedTx);
      }).catch(reject);
    }
  });

/**
 * Trigger this action to sign and broadcast a RegisterDelegateTX with Ledger Account
 * NOTE: secondPassphrase for ledger is a PIN (numeric)
 * @returns Promise - Action RegisterDelegate with Ledger
 */
export const registerDelegateWithLedger = (activePeer, account, username, pin = null) =>
  new Promise(async (resolve, reject) => {
    const rawTx = createDelegateTX(account.publicKey, username);
    let error;
    let signedTx;
    [error, signedTx] = await to(signTransactionWithLedger(rawTx, account, pin));
    if (error) {
      reject(error);
    } else {
      activePeer.transactions.broadcast(signedTx).then(() => {
        resolve(signedTx);
      }).catch(reject);
    }
  });

/**
 * Trigger this action to sign and broadcast a VoteTX with Ledger Account
 * NOTE: secondPassphrase for ledger is a PIN (numeric)
 * @returns Promise - Action Vote with Ledger
 */
export const voteWithLedger = (activePeer, account, votedList, unvotedList, pin = null) =>
  new Promise(async (resolve, reject) => {
    const rawTx = createRawVoteTX(account.publicKey, account.address, votedList, unvotedList);
    let error;
    let signedTx;
    [error, signedTx] = await to(signTransactionWithLedger(rawTx, account, pin));
    if (error) {
      reject(error);
    } else {
      activePeer.transactions.broadcast(signedTx).then(() => {
        resolve(signedTx);
      }).catch(reject);
    }
  });

/**
 * Trigger this action to sign and broadcast a SetSecondPassphraseTX with Ledger Account
 * NOTE: secondPassphrase for ledger is a PIN (numeric)
 * @returns Promise - Action SetSecondPassphrase with Ledger
 */
export const setSecondPassphraseWithLedger = (activePeer, account, pin) =>
  new Promise(async (resolve, reject) => {
    let error;
    let signedTx;
    let secondPublicKey;
    [error, secondPublicKey] =
      await to(getPublicKeyFromLedgerIndex(
        calculateSecondPassphraseIndex(account.hwInfo.derivationIndex, pin)));
    if (error) {
      reject(error);
      return;
    }
    const rawTx = createSecondPassphraseTX(account.publicKey, secondPublicKey);

    // No PIN as second Signature
    [error, signedTx] = await to(signTransactionWithLedger(rawTx, account));
    if (error) {
      reject(error);
    } else {
      activePeer.transactions.broadcast(signedTx).then(() => {
        resolve(signedTx);
      }).catch(reject);
    }
  });


export const getLedgerAccountInfo = async (activePeer, accountIndex) => {
  const liskLedger = await getLiskDposLedger();
  const ledgerAccount = getLedgerAccount(accountIndex);

  const accountInfo = await liskLedger.getPubKey(ledgerAccount);
  let resAccount = await getAccount(activePeer, accountInfo.address);

  const isInitialized = !!resAccount.unconfirmedBalance;
  Object.assign(resAccount, { isInitialized });
  // Set PublicKey from Ledger Info
  // so we can switch on this account even if publicKey is not revealed to the network
  Object.assign(resAccount, { publicKey: accountInfo.publicKey });

  if (isInitialized) {
    const txAccount = await getTransactions(activePeer, accountInfo.address);
    Object.assign(resAccount, { txCount: txAccount.meta.count });

    const votesAccount = await getVotes(activePeer, accountInfo.address);
    Object.assign(resAccount, { votesCount: votesAccount.data.votesUsed });
  }

  return resAccount;
};
