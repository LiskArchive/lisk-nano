import Lisk from 'lisk-js';

export const getAccount = (activePeer, address) =>
  activePeer.accounts.get({ address });

export const setSecondPassphrase = (activePeer, secondPassphrase, publicKey, passphrase) => {
  const transaction = Lisk.transaction
    .registerSecondPassphrase({ passphrase, secondPassphrase });
  return activePeer.transactions.broadcast(transaction);
};

export const send = (activePeer, recipientId, amount, passphrase, secondPassphrase = null) => {
  const transaction = Lisk.transaction
    .transfer({ recipientId, amount, passphrase, secondPassphrase });
  return activePeer.transactions.broadcast(transaction);
};

export const transactions = (activePeer, address, limit = 20, offset = 0, sort = 'timestamp:desc') =>
  activePeer.transactions.get({
    senderId: address,
    // recipientId: address,
    limit,
    offset,
    sort,
  });

export const unconfirmedTransactions = (activePeer, address, limit = 20, offset = 0, sort = 'timestamp:desc') =>
  activePeer.transactions.getTransactions('node/transactions/unconfirmed', {
    senderId: address,
    recipientId: address,
    limit,
    offset,
    sort,
  });

export const extractPublicKey = passphrase =>
  Lisk.cryptography.getKeys(passphrase).publicKey;

/**
 * @param {String} data - passphrase or public key
 */
export const extractAddress = (data) => {
  if (data.indexOf(' ') < 0) {
    return Lisk.cryptography.getAddress(data);
  }
  const { publicKey } = Lisk.cryptography.getKeys(data);
  return Lisk.cryptography.getAddress(publicKey);
};
