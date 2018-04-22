import i18next from 'i18next';
import { getAccount, extractAddress, extractPublicKey } from '../../utils/api/account';
import { accountLoggedIn } from '../../actions/account';
import actionTypes from '../../constants/actions';
import loginTypes from '../../constants/loginTypes';
import { errorToastDisplayed } from '../../actions/toaster';
import { loadingStarted, loadingFinished } from '../../utils/loading';

const loginMiddleware = store => next => (action) => {
  if (action.type !== actionTypes.activePeerSet) {
    return next(action);
  }

  next(Object.assign({}, action, { data: {
    activePeer: action.data.activePeer,
    options: action.data.options,
  },
  }));

  const { passphrase } = action.data;
  const publicKey = passphrase ? extractPublicKey(passphrase) : action.data.publicKey;
  const address = extractAddress(publicKey);
  const loginType = passphrase ? loginTypes.passphrase : action.data.loginType;
  const accountBasics = {
    passphrase,
    publicKey,
    address,
    loginType,
    hwInfo: action.data.hwInfo,
  };
  const { activePeer } = action.data;
  loadingStarted('loginMiddleware');
  // redirect to main/transactions
  return getAccount(activePeer, address).then((accountData) => {
    loadingFinished('loginMiddleware');
    store.dispatch(accountLoggedIn({
      ...accountData,
      ...accountBasics,
      ...{ isDelegate: accountData.delegate !== undefined },
    }));
  }).catch(() => {
    store.dispatch(errorToastDisplayed({ label: i18next.t('Unable to connect to the node') }));
  });
};

export default loginMiddleware;
