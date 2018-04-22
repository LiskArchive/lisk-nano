import i18next from 'i18next';
import actionTypes from '../constants/actions';
import { setSecondPassphrase, send } from '../utils/api/account';
import { sendWithLedger, registerDelegateWithLedger, setSecondPassphraseWithLedger } from '../utils/api/ledger';
import { registerDelegate } from '../utils/api/delegate';
import { transactionAdded } from './transactions';
import { errorAlertDialogDisplayed } from './dialog';
import Fees from '../constants/fees';
import { toRawLsk } from '../utils/lsk';
import transactionTypes from '../constants/transactionTypes';
import { loadingStarted, loadingFinished } from '../utils/loading';
import loginTypes from '../constants/loginTypes';
import to from '../utils/to';

/**
 * Trigger this action to update the account object
 * while already logged in
 *
 * @param {Object} data - account data
 * @returns {Object} - Action object
 */
export const accountUpdated = data => ({
  data,
  type: actionTypes.accountUpdated,
});

/**
 * Trigger this action to log out of the account
 * while already logged in
 *
 * @returns {Object} - Action object
 */
export const accountLoggedOut = () => ({
  type: actionTypes.accountLoggedOut,
});

/**
 * Trigger this action to login to an account
 * The login middleware triggers this action
 *
 * @param {Object} data - account data
 * @returns {Object} - Action object
 */
export const accountLoggedIn = data => ({
  type: actionTypes.accountLoggedIn,
  data,
});

export const passphraseUsed = data => ({
  type: actionTypes.passphraseUsed,
  data,
});

/**
 *
 */
export const secondPassphraseRegistered = ({ activePeer, secondPassphrase, account }) =>
  async (dispatch) => {
    loadingStarted('secondPassphraseRegistered');

    let error;
    let callReslut;

    switch (account.loginType) {
      case loginTypes.passphrase:
        [error, callReslut] = await to(setSecondPassphrase(activePeer, secondPassphrase,
          account.publicKey, account.passphrase));
        break;

      case loginTypes.ledgerNano:
        [error, callReslut] =
          await to(setSecondPassphraseWithLedger(activePeer, account, secondPassphrase));
        break;

      case loginTypes.trezor:
        dispatch(errorAlertDialogDisplayed({ text: i18next.t('Not Yet Implemented. Sorry.') }));
        break;

      default:
        dispatch(errorAlertDialogDisplayed({ text: i18next.t('Login Type not recognized.') }));
    }

    loadingFinished('secondPassphraseRegistered');

    if (error) {
      const text = error && error.message ? `${error.message}.` : i18next.t('An error occurred while creating the transaction.');
      dispatch(errorAlertDialogDisplayed({ text }));
    } else {
      dispatch(transactionAdded({
        id: callReslut.id,
        senderPublicKey: account.publicKey,
        senderId: account.address,
        amount: 0,
        fee: Fees.setSecondPassphrase,
        type: transactionTypes.setSecondPassphrase,
      }));
      dispatch(passphraseUsed(account.passphrase));
    }
  };

/**
 *
 */
export const delegateRegistered = ({
  activePeer, account, passphrase, username, secondPassphrase }) =>
  async (dispatch) => {
    loadingStarted('delegateRegistered');

    let error;
    let callReslut;

    switch (account.loginType) {
      case loginTypes.passphrase:
        [error, callReslut] =
          await to(registerDelegate(activePeer, username, passphrase, secondPassphrase));
        break;

      // eslint-disable-next-line no-case-declarations
      case loginTypes.ledgerNano:
        [error, callReslut] =
          await to(registerDelegateWithLedger(activePeer, account, username, secondPassphrase));
        break;

      case loginTypes.trezor:
        dispatch(errorAlertDialogDisplayed({ text: i18next.t('Not Yet Implemented. Sorry.') }));
        break;

      default:
        dispatch(errorAlertDialogDisplayed({ text: i18next.t('Login Type not recognized.') }));
    }

    loadingFinished('delegateRegistered');

    if (error) {
      const text = error && error.message ? `${error.message}.` : i18next.t('An error occurred while creating the transaction.');
      dispatch(errorAlertDialogDisplayed({ text }));
    } else {
      dispatch(transactionAdded({
        id: callReslut.id,
        senderPublicKey: account.publicKey,
        senderId: account.address,
        username,
        amount: 0,
        fee: Fees.registerDelegate,
        type: transactionTypes.registerDelegate,
      }));
      dispatch(passphraseUsed(passphrase));
    }
  };

/**
 *
 */
export const sent = ({ activePeer, account, recipientId,
  amount, passphrase, secondPassphrase, data }) =>
  async (dispatch) => {
    loadingStarted('sent');

    let error;
    let callReslut;

    switch (account.loginType) {
      case loginTypes.passphrase:
        [error, callReslut] = await to(send(activePeer, recipientId, toRawLsk(amount),
          passphrase, secondPassphrase, data));
        break;

      case loginTypes.ledgerNano:
        [error, callReslut] = await to(sendWithLedger(activePeer, account, recipientId,
          toRawLsk(amount), secondPassphrase, data));
        break;

      case loginTypes.trezor:
        dispatch(errorAlertDialogDisplayed({ text: i18next.t('Not Yet Implemented. Sorry.') }));
        break;

      default:
        dispatch(errorAlertDialogDisplayed({ text: i18next.t('Login Type not recognized.') }));
    }

    loadingFinished('sent');

    if (error) {
      const text = error && error.message ? `${error.message}.` : i18next.t('An error occurred while creating the transaction.');
      dispatch(errorAlertDialogDisplayed({ text }));
    } else {
      dispatch(transactionAdded({
        id: callReslut.id,
        senderPublicKey: account.publicKey,
        senderId: account.address,
        recipientId,
        amount: toRawLsk(amount),
        fee: Fees.send,
        type: transactionTypes.send,
      }));
      dispatch(passphraseUsed(passphrase));
    }
  };
