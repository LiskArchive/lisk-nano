import { requestToActivePeer } from './peers';

export const listAccountDelegates = (activePeer, address) =>
  requestToActivePeer(activePeer, 'accounts/delegates', { address });


export const listDelegates = (activePeer, options) =>
  requestToActivePeer(activePeer, `delegates/${options.q ? 'search' : ''}`, options);

export const getDelegate = (activePeer, options) =>
  requestToActivePeer(activePeer, 'delegates/get', options);

export const vote = (activePeer, secret, publicKey, voteList, unvoteList, secondSecret = null) => {
  const votingList = unvoteList.map(delegate => ({ username: delegate.username, publicKey: `-${delegate.publicKey}` }))
    .concat(voteList.map(delegate => ({ username: delegate.username, publicKey: `+${delegate.publicKey}` })));
  const chunk = (arr, chunkSize) => {
    const R = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    return R;
  };
  const votingLists = chunk(votingList, 33);

  const mapSeries = (responses, arr, func) => (
    arr.reduce((p, ele, i) => p.then((response) => {
      if (response) {
        responses.push({ data: response, ele: arr[i - 1] });
      }
      return func(ele);
    }), Promise.resolve()).then((response) => {
      responses.push(response);
      return responses;
    })
  );

  const responses = [];
  return mapSeries(responses, votingLists, delegates =>
    requestToActivePeer(activePeer, 'accounts/delegates', {
      secret,
      publicKey,
      delegates: delegates.map(dg => dg.publicKey),
      secondSecret,
    }),
  ).catch(error => Promise.reject({ error, responses }));
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
    .filter(delegate => delegate.indexOf(username) !== -1 && votedDict[delegate].unconfirmed)
    .map(element => ({ username: element, publicKey: votedDict[element].publicKey }))),
  );

export const registerDelegate = (activePeer, username, secret, secondSecret = null) => {
  const data = { username, secret };
  if (secondSecret) {
    data.secondSecret = secondSecret;
  }
  return requestToActivePeer(activePeer, 'delegates', data);
};
