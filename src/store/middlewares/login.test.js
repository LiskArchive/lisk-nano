import Lisk from 'lisk-elements';
import { expect } from 'chai';
import { spy, stub, mock } from 'sinon';
import middleware from './login';
import actionTypes from '../../constants/actions';
import * as accountApi from '../../utils/api/account';
import * as delegateApi from '../../utils/api/delegate';

describe('Login middleware', () => {
  let store;
  let next;
  const passphrase = 'wagon stock borrow episode laundry kitten salute link globe zero feed marble';
  const nethash = '198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d';
  const activePeer = new Lisk.APIClient(['http://localhost:4000'], nethash, {});

  const activePeerSetAction = {
    type: actionTypes.activePeerSet,
    data: {
      passphrase,
      activePeer,
    },
  };

  beforeEach(() => {
    next = spy();
    store = stub();
    store.getState = () => ({
      peers: {
        data: {},
      },
      account: {},
    });
    store.dispatch = spy();
  });

  it(`should just pass action along for all actions except ${actionTypes.activePeerSet}`, () => {
    const sampleAction = {
      type: 'SAMPLE_TYPE',
      data: 'SAMPLE_DATA',
    };
    middleware(store)(next)(sampleAction);
    expect(next).to.have.been.calledWith(sampleAction);
  });

  it.skip(`should action data to only have activePeer on ${actionTypes.activePeerSet} action`, () => {
    middleware(store)(next)(activePeerSetAction);
    const peerMock = mock(activePeer.node);
    peerMock.expects('getConstants').withArgs()
      .returnsPromise().resolves({ nethash });
    peerMock.restore();
    peerMock.verify();
    expect(next).to.have.been.calledWith({
      type: actionTypes.activePeerSet,
      data: activePeer,
    });
  });

  it(`should fetch account and delegate info on ${actionTypes.activePeerSet} action (non delegate)`, () => {
    const accountApiMock = stub(accountApi, 'getAccount').returnsPromise().resolves({ success: true, balance: 0 });
    const delegateApiMock = stub(delegateApi, 'getDelegate').returnsPromise().rejects({ success: false });

    middleware(store)(next)(activePeerSetAction);
    expect(store.dispatch).to.have.been.calledWith();

    accountApiMock.restore();
    delegateApiMock.restore();
  });

  it.skip(`should fetch account and delegate info on ${actionTypes.activePeerSet} action (delegate)`, () => {
    const accountApiMock = stub(accountApi, 'getAccount').returnsPromise().resolves({ success: true, balance: 0 });
    const delegateApiMock = stub(delegateApi, 'getDelegate').returnsPromise().resolves({
      success: true,
      delegate: { username: 'TEST' },
      username: 'TEST',
    });

    middleware(store)(next)(activePeerSetAction);
    expect(store.dispatch).to.have.been.calledWith();

    accountApiMock.restore();
    delegateApiMock.restore();
  });
});

