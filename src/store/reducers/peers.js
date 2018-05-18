import actionTypes from '../../constants/actions';

/**
 * The reducer for maintaining active peer
 *
 * @param {Array} state - the current state object
 * @param {Object} action - The action containing type and data
 *
 * @returns {Object} - Next state object
 */
const peers = (state = { status: {}, options: {} }, action) => {
  switch (action.type) {
    case actionTypes.activePeerSet:
      return Object.assign({}, state, {
        data: action.data.activePeer,
        // options are duplicated here because lisk-elements doesn't expose it as lisk-js did
        options: action.data.options,
      });
    case actionTypes.activePeerUpdate:
      return Object.assign({}, state, { status: action.data });
    case actionTypes.accountLoggedOut:
      return Object.assign({}, state, { data: {}, status: {}, options: {} });
    default:
      return state;
  }
};

export default peers;
