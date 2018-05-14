import Lisk from 'lisk-js';

export const listAccountDelegates = (activePeer, address) =>
  activePeer.votes.get({ address, limit: 101 });


export const listDelegates = (activePeer, options) => {
  options.sort = 'rank:asc';
  return activePeer.delegates.get(options);
};

export const getDelegate = (activePeer, options) =>
  activePeer.delegates.get(options);

export const vote = (activePeer, passphrase, publicKey,
  votes, unvotes, secondPassphrase = null) =>
  new Promise((resolve, reject) => {
    const transaction = Lisk.transaction
      .castVotes({
        passphrase,
        votes,
        unvotes,
        secondPassphrase });
    activePeer.transactions.broadcast(transaction).then(() => {
      resolve(transaction);
    })
      .catch(reject);
  });

export const voteAutocomplete = (activePeer, username, votedDict) => {
  const options = { search: username };

  return new Promise((resolve, reject) =>
    listDelegates(activePeer, options)
      .then((response) => {
        resolve(response.data.filter(delegate =>
          Object.keys(votedDict).filter(item => item === delegate.username).length === 0,
        ));
      })
      .catch(reject),
  );
};

export const unvoteAutocomplete = (username, votedDict) =>
  new Promise(resolve => resolve(Object.keys(votedDict)
    .filter(delegate => delegate.indexOf(username) !== -1 && votedDict[delegate].unconfirmed)
    .map(element => ({ username: element, publicKey: votedDict[element].publicKey }))),
  );

export const registerDelegate = (activePeer, username, passphrase, secondPassphrase = null) =>
  new Promise((resolve) => {
    const transaction = Lisk.transaction
      .registerDelegate({
        username,
        passphrase,
        secondPassphrase });
    activePeer.transactions.broadcast(transaction).then(() => {
      resolve(transaction);
    });
  });
