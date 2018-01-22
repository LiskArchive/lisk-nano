import Lisk from 'lisk-js';
import { requestToActivePeer } from './peers';

export const getAccount = (activePeer, address) =>
  new Promise((resolve, reject) => {
    requestToActivePeer(activePeer, 'accounts', { address }).then((data) => {
      if (data.data.length === 1) {
        resolve({
          ...data.data[0],
          serverPublicKey: data.data.publicKey,
        });
      } else if (data.data.length === 0) {
        // when the account has no transactions yet (therefore is not saved on the blockchain)
        // this endpoint returns data: []
        resolve({
          address,
          balance: 0,
        });
      } else {
        reject(data);
      }
    });
  });

export const setSecondPassphrase = (activePeer, secondSecret, publicKey, secret) =>
  requestToActivePeer(activePeer, 'signatures', { secondSecret, publicKey, secret });

export const send = (activePeer, recipientId, amount, secret, secondSecret = null) =>
  requestToActivePeer(activePeer, 'transactions',
    { recipientId, amount, secret, secondSecret });

export const transactions = (activePeer, address, limit = 20, offset = 0, sort = 'timestamp:desc') =>
  requestToActivePeer(activePeer, 'transactions', {
    senderId: address,
    recipientId: address,
    limit,
    offset,
    sort,
  });

export const unconfirmedTransactions = (activePeer, address, limit = 20, offset = 0, sort = 'timestamp:desc') =>
  requestToActivePeer(activePeer, 'node/transactions/unconfirmed', {
    senderId: address,
    recipientId: address,
    limit,
    offset,
    sort,
  });

export const extractPublicKey = passphrase =>
  Lisk.crypto.getKeys(passphrase).publicKey;

/**
 * @param {String} data - passphrase or public key
 */
export const extractAddress = (data) => {
  if (data.indexOf(' ') < 0) {
    return Lisk.crypto.getAddress(data);
  }
  const { publicKey } = Lisk.crypto.getKeys(data);
  return Lisk.crypto.getAddress(publicKey);
};
