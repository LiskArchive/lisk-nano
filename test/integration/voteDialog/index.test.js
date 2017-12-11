import { step } from 'mocha-steps';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { prepareStore, renderWithRouter } from '../../../src/utils/applicationInit';
import actionTypes from '../../../src/constants/actions';
import accountReducer from '../../../src/store/reducers/account';
import votingReducer from '../../../src/store/reducers/voting';
import peersReducer from '../../../src/store/reducers/peers';
import { accountLoggedIn } from '../../../src/actions/account';
import { delegatesAdded } from '../../../src/actions/voting';
import * as delegateApi from '../../../src/utils/api/delegate';
import VoteDialog from '../../../src/components/voteDialog';

const delegates = [
  { username: 'username1', publicKey: '123HG3452245X' },
  { username: 'username2', publicKey: '123HG3522345X' },
];
const unvotedDelegate = [
  { username: 'username3', publicKey: '123HG3522445X' },
  { username: 'username4', publicKey: '123HG3522545X' },
];

const keyCodes = {
  arrowDown: 40,
  arrowUp: 38,
  enter: 13,
  escape: 27,
};

const realAccount = {
  address: '16313739661670634666X',
  balance: '346215336704',
  delegate: {},
  multisignatures: [],
  passphrase: 'wagon stock borrow episode laundry kitten salute link globe zero feed marble',
  publicKey: 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f',
  u_multisignatures: [],
  unconfirmedBalance: '0',
};

const peers = {
  defaultPeers: [
    'corenode1.oxycoin.io',
    'corenode2.oxycoin.io',
  ],
  defaultSSLPeers: [
    'corenode1.oxycoin.io',
    'corenode2.oxycoin.io',
  ],
  defaultTestnetPeers: [
    'testnode1.oxycoin.io',
  ],
  options: {
    name: 'Testnet',
    testnet: true,
    ssl: true,
    port: 443,
    code: 1,
  },
  ssl: true,
  randomPeer: true,
  testnet: true,
  bannedPeers: [],
  currentPeer: 'testnode1.oxycoin.io',
  port: 9999,
  nethash: {
    'Content-Type': 'application/json',
    nethash: '0daee950841005a3f56f6588b4b084695f0d74aaa38b21edab73446064638552',
    broadhash: '0daee950841005a3f56f6588b4b084695f0d74aaa38b21edab73446064638552',
    os: 'lisk-js-api',
    version: '1.0.0',
    minVersion: '>=0.5.0',
    port: 9999,
  },
};

describe('@integration test of VoteDialog', () => {
  let store;
  let wrapper;
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date'],
    });
  });
  afterEach(() => {
    clock.restore();
  });

  step('Given user is login in', () => {
    store = prepareStore({
      account: accountReducer,
      voting: votingReducer,
      peers: peersReducer,
    });

    store.dispatch(accountLoggedIn(realAccount));
    store.dispatch({
      data: peers,
      type: actionTypes.activePeerSet,
    });
    wrapper = mount(renderWithRouter(VoteDialog, store));
    expect(store.getState().account).to.be.an('Object');
    expect(store.getState().voting).to.be.an('Object');
    expect(store.getState().peers).to.be.an('Object');
  });

  step('When user doesn\'t vote to any delegates confirm button should be disabled', () => {
    expect(wrapper.find('.primary-button button').props().disabled).to.be.equal(true);
  });

  step('Then user add an item to voteList and confirm button should become enabled', () => {
    store.dispatch(delegatesAdded({
      list: delegates,
      totalDelegates: 100,
      refresh: true,
    }));
    expect(store.getState().voting.refresh).to.be.equal(true);
    wrapper.update();
    const voteAutocompleteApiStub = sinon.stub(delegateApi, 'voteAutocomplete');
    voteAutocompleteApiStub.returnsPromise().resolves(unvotedDelegate);
    // write a username
    wrapper.find('.votedListSearch.vote-auto-complete input').simulate('change', { target: { value: 'user' } });
    clock.tick(400);

    // select it with arrow down
    wrapper.find('.votedListSearch.vote-auto-complete input').simulate('keyDown', { keyCode: keyCodes.arrowDown });
    clock.tick(400);
    wrapper.find('.votedListSearch.vote-auto-complete input').simulate('keyDown', { keyCode: keyCodes.enter });
    wrapper.update();
    expect(wrapper.find('.primary-button button').props().disabled).to.be.equal(false);
    voteAutocompleteApiStub.restore();
  });

  step('When user deletes all items form voteList confirm button should become disabled', () => {
    wrapper.find('.vote-list span').last().simulate('click');
    wrapper.update();
    expect(wrapper.find('.primary-button button').props().disabled).to.be.equal(true);
  });
});
