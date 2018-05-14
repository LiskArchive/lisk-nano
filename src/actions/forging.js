import actionTypes from '../constants/actions';
import { getForgedBlocks, getForgedStats } from '../utils/api/forging';
import { errorAlertDialogDisplayed } from './dialog';
import { loadingStarted, loadingFinished } from '../utils/loading';

export const forgedBlocksUpdated = data => ({
  data,
  type: actionTypes.forgedBlocksUpdated,
});

export const fetchAndUpdateForgedBlocks = ({ activePeer, limit, offset, generatorPublicKey }) =>
  (dispatch) => {
    loadingStarted('fetchAndUpdateForgedBlocks');
    getForgedBlocks(activePeer, limit, offset, generatorPublicKey)
      .then((response) => {
        loadingFinished('fetchAndUpdateForgedBlocks');
        return dispatch(forgedBlocksUpdated(response.data));
      })
      .catch((error) => {
        dispatch(errorAlertDialogDisplayed({ text: error.message }));
      });
  };

export const forgingStatsUpdated = data => ({
  data,
  type: actionTypes.forgingStatsUpdated,
});

export const fetchAndUpdateForgedStats = ({ activePeer, key, startMoment, generatorPublicKey }) =>
  (dispatch) => {
    loadingStarted('fetchAndUpdateForgedStats');
    getForgedStats(activePeer, startMoment, generatorPublicKey)
      .then((response) => {
        loadingFinished('fetchAndUpdateForgedStats');
        return dispatch(forgingStatsUpdated({ [key]: response.data.forged }));
      })
      .catch((error) => {
        dispatch(errorAlertDialogDisplayed({ text: error.message }));
      });
  };
