import i18next from 'i18next';

import { fromRawLsk } from '../../utils/lsk';
import { unconfirmedTransactions } from '../../utils/api/account';
import { successAlertDialogDisplayed } from '../../actions/dialog';
import { transactionsFailed } from '../../actions/transactions';
import actionTypes from '../../constants/actions';
import transactionTypes from '../../constants/transactionTypes';

const transactionAdded = (store, action) => {
  const texts = {
    [transactionTypes.setSecondPassphrase]: i18next.t('Second passphrase registration was successfully submitted. It can take several seconds before it is processed.'),
    [transactionTypes.registerDelegate]: i18next.t('Delegate registration was successfully submitted with username: "{{username}}". It can take several seconds before it is processed.',
      { username: action.data.username }),
    [transactionTypes.vote]: i18next.t('Your votes were successfully submitted. It can take several seconds before they are processed.'),
    [transactionTypes.send]: i18next.t('Your transaction of {{amount}} LSK to {{recipientAddress}} was accepted and will be processed in a few seconds.',
      { amount: fromRawLsk(action.data.amount), recipientAddress: action.data.recipientId }),
  };
  const text = texts[action.data.type];
  const newAction = successAlertDialogDisplayed({ text });
  store.dispatch(newAction);
};

// eslint-disable-next-line no-unused-vars
const transactionsUpdated = (store) => {
  const { transactions, account, peers } = store.getState();
  if (transactions.pending.length) {
    unconfirmedTransactions(peers.data, account.address)
      .then(response => store.dispatch(transactionsFailed({
        failed: transactions.pending.filter(tx =>
          response.data.filter(unconfirmedTx => tx.id === unconfirmedTx.id).length === 0),
      })));
  }
};

const transactionsMiddleware = store => next => (action) => {
  next(action);
  switch (action.type) {
    case actionTypes.transactionAdded:
      transactionAdded(store, action);
      break;
    case actionTypes.transactionsUpdated:
      // this was disabled, because this caused pending transactions
      // to disappear from the list before they appeared again as confirmed.
      // Currently, the problem is that a pending transaction will not be removed
      // from the list if it fails. Caused by Lisk Core 1.0.0
      // TODO: figure out how to make this work again
      /*
      transactionsUpdated(store, action);
      */
      break;
    default: break;
  }
};

export default transactionsMiddleware;
