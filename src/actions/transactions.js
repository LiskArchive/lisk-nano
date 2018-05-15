import { errorAlertDialogDisplayed } from './dialog';
import actionTypes from '../constants/actions';
import { transactions } from '../utils/api/account';
import { loadingStarted, loadingFinished } from '../utils/loading';

/**
 * An action to dispatch transactionAdded
 *
 */
export const transactionAdded = data => ({
  data,
  type: actionTypes.transactionAdded,
});

/**
 * An action to dispatch transactionsFailed
 *
 */
export const transactionsFailed = data => ({
  data,
  type: actionTypes.transactionsFailed,
});

/**
 * An action to dispatch transactionsUpdated
 *
 */
export const transactionsUpdated = data => ({
  data,
  type: actionTypes.transactionsUpdated,
});

/**
 * An action to dispatch transactionsLoaded
 *
 */
export const transactionsLoaded = data => ({
  data,
  type: actionTypes.transactionsLoaded,
});

/**
 *
 *
 */
export const transactionsRequested = ({ activePeer, address, limit, offset }) =>
  (dispatch) => {
    loadingStarted('transactionsRequested');
    transactions(activePeer, address, limit, offset)
      .then((response) => {
        loadingFinished('transactionsRequested');
        dispatch(transactionsLoaded({
          count: parseInt(response.count, 10),
          confirmed: response.data,
        }));
      }).catch((error) => {
        loadingFinished('transactionsRequested');
        dispatch(errorAlertDialogDisplayed({ text: error.message }));
      });
  };
