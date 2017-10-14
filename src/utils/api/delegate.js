import { requestToActivePeer } from './peers';

export const listAccountDelegates = (activePeer, address) =>
  requestToActivePeer(activePeer, 'accounts/delegates', { address });


export const listDelegates = (activePeer, options) =>
  requestToActivePeer(activePeer, `delegates/${options.q ? 'search' : ''}`, options);

export const getDelegate = (activePeer, options) =>
  requestToActivePeer(activePeer, 'delegates/get', options);

export const vote = (activePeer, secret, publicKey, voteList, unvoteList, secondSecret = null) => {
  const votingList = voteList.map(delegate => `+${delegate}`).concat(unvoteList.map(delegate => `-${delegate}`));
  const chunk = (arr, chunkSize) => {
    const R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    return R;
  };
  const votingLists = chunk(votingList, 33);
  return Promise.all(votingLists.map(delegates =>
    requestToActivePeer(activePeer, 'accounts/delegates', {
      secret,
      publicKey,
      delegates,
      secondSecret,
    }),
  ));
};

export const voteAutocomplete = (activePeer, username, votedDict) => {
  const options = { q: username };

  return new Promise((resolve, reject) =>
    listDelegates(activePeer, options)
      .then((response) => {
        resolve(response.delegates.filter(delegate =>
          Object.keys(votedDict).filter(item => item === delegate.username).length === 0,
        ));
      })
      .catch(reject),
  );
};

export const unvoteAutocomplete = (username, votedDict) =>
  new Promise(resolve => resolve(Object.keys(votedDict)
    .filter(delegate => delegate.indexOf(username) !== -1)
    .map(element => ({ username: element, publicKey: votedDict[element].publicKey }))),
  );

export const registerDelegate = (activePeer, username, secret, secondSecret = null) => {
  const data = { username, secret };
  if (secondSecret) {
    data.secondSecret = secondSecret;
  }
  return requestToActivePeer(activePeer, 'delegates', data);
};
