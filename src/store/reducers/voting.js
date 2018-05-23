import actionTypes from '../../constants/actions';

const mergeVotes = (newList, oldDict) => {
  const newDict = newList.reduce((tempDict, delegate) => {
    tempDict[delegate.username] = {
      confirmed: true,
      unconfirmed: true,
      pending: false,
      account: delegate.account,
    };
    return tempDict;
  }, {});

  Object.keys(oldDict).forEach((username) => {
    // By pendingVotesAdded, we set confirmed equal to unconfirmed,
    // to recognize pending-not-voted items from pending-voted
    // so here we just check unconfirmed flag.
    const { confirmed, unconfirmed, pending } = oldDict[username];
    if (// we've voted but it's not in the new list
      (pending && unconfirmed && newDict[username] === undefined) ||
    // we've un-voted but it still exists in the new list
      (pending && !unconfirmed && newDict[username] !== undefined) ||
      // dirty, not voted for and not updated in other client
      (!pending && unconfirmed !== confirmed &&
        (newDict[username] === undefined || confirmed === newDict[username].confirmed))
    ) {
      newDict[username] = Object.assign({}, oldDict[username]);
    }
  });

  return newDict;
};

/**
 * voting reducer
 *
 * @param {Object} state
 * @param {Object} action
 */
const voting = (state = {
  votes: {},
  delegates: [],
  totalDelegates: 0,
  voteLookupStatus: {},
}, action) => {
  switch (action.type) {
    case actionTypes.votesAdded:
      return Object.assign({}, state, {
        votes: action.data.list
          .reduce((votesDict, delegate) => {
            votesDict[delegate.username] = {
              confirmed: true,
              unconfirmed: true,
              publicKey: delegate.publicKey,
            };
            return votesDict;
          }, {}),
        refresh: false,
      });

    case actionTypes.delegatesAdded:
      return Object.assign({}, state, {
        delegates: action.data.refresh ? action.data.list :
          [...state.delegates, ...action.data.list],
        totalDelegates: action.data.totalDelegates,
        refresh: true,
      });

    case actionTypes.voteToggled: {
      const { username, publicKey } = action.data;

      const newVotes = Object.assign({}, state.votes);
      const currentVote = state.votes[username];
      if (currentVote && currentVote.unconfirmed && !currentVote.confirmed) {
        delete newVotes[action.data.username];
      } else {
        newVotes[username] = {
          confirmed: currentVote ? currentVote.confirmed : false,
          unconfirmed: currentVote ? !currentVote.unconfirmed : true,
          publicKey,
        };
      }

      return Object.assign({}, state, {
        refresh: false,
        votes: newVotes,
      });
    }

    case actionTypes.accountLoggedOut:
      return Object.assign({}, state, {
        votes: {},
        delegates: [],
        refresh: true,
      });

    case actionTypes.votesCleared:
      return Object.assign({}, state, {
        votes: Object.keys(state.votes).reduce((votesDict, username) => {
          votesDict[username] = {
            confirmed: state.votes[username].confirmed,
            unconfirmed: state.votes[username].confirmed,
            publicKey: state.votes[username].publicKey,
            pending: false,
          };
          return votesDict;
        }, {}),
        refresh: true,
      });

    case actionTypes.votesUpdated:
      return Object.assign({}, state, {
        votes: mergeVotes(action.data.list, state.votes),
        refresh: false,
      });

    case actionTypes.pendingVotesAdded:
      return Object.assign({}, state, {
        refresh: false,
        votes: Object.keys(state.votes).reduce((votesDict, username) => {
          const { confirmed, unconfirmed, publicKey, pending } = state.votes[username];
          const nextPendingStatus = pending || (confirmed !== unconfirmed);

          votesDict[username] = {
            confirmed: nextPendingStatus ? !confirmed : confirmed,
            unconfirmed,
            pending: nextPendingStatus,
            publicKey,
          };
          return votesDict;
        }, {}),
      });

    case actionTypes.voteLookupStatusUpdated:
      return {
        ...state,
        voteLookupStatus: {
          ...state.voteLookupStatus,
          [action.data.username]: action.data.status,
        },
      };

    case actionTypes.voteLookupStatusCleared:
      return {
        ...state,
        voteLookupStatus: { },
      };

    default:
      return state;
  }
};

export default voting;
