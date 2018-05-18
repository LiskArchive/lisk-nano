import i18next from 'i18next';
import Lisk from 'lisk-elements';
import actionTypes from '../constants/actions';
// import { getNethash } from './../utils/api/nethash';
import { errorToastDisplayed } from './toaster';
import netHashes from '../constants/netHashes';
import { loadingStarted, loadingFinished } from '../utils/loading';

const peerSet = (data, config) => ({
  data: Object.assign({
    passphrase: data.passphrase,
    publicKey: data.publicKey,
    activePeer: new Lisk.APIClient(config.nodes, config.nethash, {}),
    options: config,
  }),
  type: actionTypes.activePeerSet,
});

/**
 * Returns required action object to set
 * the given peer data as active peer
 * This should be called once in login page
 *
 * @param {Object} data - Active peer data and the passphrase of account
 * @returns {Object} Action object
 */
export const activePeerSet = data =>
  (dispatch) => {
    const addHttp = (url) => {
      const reg = /^(?:f|ht)tps?:\/\//i;
      return reg.test(url) ? url : `http://${url}`;
    };
    const config = data.network || {};

    if (config.address) {
      const { hostname, port, protocol } = new URL(addHttp(config.address));

      config.node = hostname;
      config.ssl = protocol === 'https:';
      config.port = port || (config.ssl ? 443 : 80);
      config.nodes = [`${protocol}//${hostname}:${port}`];
    }
    if (config.testnet === undefined && config.port !== undefined) {
      config.testnet = config.port === '7000';
    }
    if (config.custom) {
      const getNethash = new Lisk.APIClient(config.nodes, config.nethash, {});
      loadingStarted('getConstants');
      getNethash.node.getConstants().then((response) => {
        loadingFinished('getConstants');
        config.testnet = response.data.nethash === netHashes.testnet;
        if (!config.testnet && response.data.nethash !== netHashes.mainnet) {
          config.nethash = response.data.nethash;
        }
        dispatch(peerSet(data, config));
      }).catch(() => {
        loadingFinished('getConstants');
        dispatch(errorToastDisplayed({ label: i18next.t('Unable to connect to the node') }));
      });
    } else {
      dispatch(peerSet(data, config));
    }
  };


/**
 * Returns required action object to partially
 * update the active peer
 *
 * @param {Object} data - Active peer data
 * @returns {Object} Action object
 */
export const activePeerUpdate = data => ({
  data,
  type: actionTypes.activePeerUpdate,
});
