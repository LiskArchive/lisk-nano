import i18next from 'i18next';
import { getAccount, extractAddress, extractPublicKey } from '../../utils/api/account';
import { accountLoggedIn } from '../../actions/account';
import actionTypes from '../../constants/actions';
import { errorToastDisplayed } from '../../actions/toaster';

const loginMiddleware = store => next => (action) => {
  if (action.type !== actionTypes.activePeerSet) {
    return next(action);
  }

  next(Object.assign({}, action, { data: action.data.activePeer }));

  const { passphrase } = action.data;
  const publicKey = passphrase ? extractPublicKey(passphrase) : action.data.publicKey;
  const address = extractAddress(publicKey);
  const accountBasics = {
    passphrase,
    publicKey,
    address,
  };
  const { activePeer } = action.data;

  // redirect to main/transactions
  return getAccount(activePeer, address).then(accountData =>
    store.dispatch(accountLoggedIn({
      ...accountData,
      ...accountBasics,
      ...{ isDelegate: accountData.delegate !== undefined },
    })),
  ).catch(() => store.dispatch(errorToastDisplayed({ label: i18next.t('Unable to connect to the node') })));
};

export default loginMiddleware;
