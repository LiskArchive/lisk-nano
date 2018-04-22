import { validateUrl } from './login';
import { extractAddress } from './api/account';

const isValidSavedAccount = ({ publicKey, loginType, network, address }) => {
  try {
    return extractAddress(publicKey) &&
      network >= 0 && network <= 2 && loginType &&
      (validateUrl(address).addressValidity === '' || network !== 2);
  } catch (e) {
    return false;
  }
};

export const getSavedAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem('accounts')).filter(isValidSavedAccount);
  } catch (e) {
    return [];
  }
};

export const getLastActiveAccount = () => (
  getSavedAccounts()[localStorage.getItem('lastActiveAccountIndex') || 0]
);

export const setLastActiveAccount = ({ publicKey, loginType, network, address }) => {
  const lastActiveAccountIndex = getSavedAccounts().findIndex(account => (
    account.publicKey === publicKey &&
    account.loginType === loginType &&
    account.network === network &&
    account.address === address
  ));
  if (lastActiveAccountIndex > -1) {
    localStorage.setItem('lastActiveAccountIndex', lastActiveAccountIndex);
  }
  return lastActiveAccountIndex;
};

export const setSavedAccount = ({ publicKey, loginType, network, address, hwInfo }) => {
  const savedAccounts = [
    ...getSavedAccounts(),
    {
      publicKey,
      loginType,
      network,
      address,
      hwInfo,
    },
  ];
  localStorage.setItem('accounts', JSON.stringify(savedAccounts));
  return savedAccounts;
};

export const removeSavedAccount = ({ publicKey, loginType, network, address }) => {
  const accounts = getSavedAccounts().filter(account =>
    !(account.publicKey === publicKey &&
      account.loginType === loginType &&
      account.network === network &&
      account.address === address));
  localStorage.setItem('accounts', JSON.stringify(accounts));
  return accounts;
};
