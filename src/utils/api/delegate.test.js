import { expect } from 'chai';
import sinon from 'sinon';
import Lisk from 'lisk-elements';
import { listAccountDelegates,
  listDelegates,
  getDelegate,
  vote,
  voteAutocomplete,
  unvoteAutocomplete,
  registerDelegate } from './delegate';

const username = 'genesis_1';
const secret = 'sample_secret';
const secondSecret = 'samepl_second_secret';
const publicKey = '';

describe('Utils: Delegate', () => {
  let peersMock;
  let activePeer;

  beforeEach(() => {
    activePeer = new Lisk.APIClient(['http://localhost:4000'], {});
    peersMock = sinon.mock(activePeer.delegates);
  });

  afterEach(() => {
    peersMock.verify();
    peersMock.restore();
  });

  describe('listAccountDelegates', () => {
    it('should return a promise', () => {
      const votingMock = sinon.mock(activePeer.votes);
      votingMock.expects('get').withArgs({ address: 'address', limit: 101 })
        .returnsPromise().resolves('resolved promise');
      const returnedPromise = listAccountDelegates(activePeer, 'address');
      return expect(returnedPromise).to.eventually.equal('resolved promise');
    });
  });

  describe('listDelegates', () => {
    it('should return activePeer.delegates.get(activePeer, options) if options = {}', () => {
      const options = {};
      peersMock.expects('get').withArgs(options)
        .returnsPromise().resolves('resolved promise');
      const returnedPromise = listDelegates(activePeer, options);
      return expect(returnedPromise).to.eventually.equal('resolved promise');
    });

    it('should return activePeer.delegates.get(activePeer, options) if options.search is set', () => {
      const options = { search: 'genesis_1' };
      peersMock.expects('get').withArgs(options)
        .returnsPromise().resolves('resolved promise');

      const returnedPromise = listDelegates(activePeer, options);
      return expect(returnedPromise).to.eventually.equal('resolved promise');
    });
  });

  describe('getDelegate', () => {
    it('should return activePeer.delegates.get(activePeer, options)', () => {
      const options = { publicKey: '"86499879448d1b0215d59cbf078836e3d7d9d2782d56a2274a568761bff36f19"' };
      peersMock.expects('get').withArgs(options)
        .returnsPromise().resolves('resolved promise');

      const returnedPromise = getDelegate(activePeer, options);
      return expect(returnedPromise).to.eventually.equal('resolved promise');
    });
  });

  describe('unvoteAutocomplete', () => {
    it('should return a promise that resolves an empty array when trying to unvote a non-existing user name', () => {
      const voteList = {
        genesis_1: { confirmed: true, unconfirmed: false, publicKey: 'sample_key' },
        genesis_2: { confirmed: true, unconfirmed: false, publicKey: 'sample_key' },
        genesis_3: { confirmed: true, unconfirmed: false, publicKey: 'sample_key' },
      };

      const nonExistingUsername = 'genesis_4';
      return expect(unvoteAutocomplete(nonExistingUsername, voteList)).to.eventually.eql([]);
    });

    it('should return a promise that resolves an array when trying to unvote an existing user name', () => {
      const voteList = {
        genesis_1: { confirmed: true, unconfirmed: true, publicKey: 'sample_key' },
        genesis_2: { confirmed: true, unconfirmed: false, publicKey: 'sample_key' },
        genesis_3: { confirmed: true, unconfirmed: false, publicKey: 'sample_key' },
      };

      const expectedResult = [{ username: 'genesis_1', publicKey: 'sample_key' }];
      return expect(unvoteAutocomplete(username, voteList)).to.eventually.eql(expectedResult);
    });
  });

  describe('registerDelegate', () => {
    it('should return a promise', () => {
      const data = {
        username: 'giraffe laugh math dash chalk butter ghost report truck interest merry lens',
        passphrase: 'wagon dens',
        secondPassphrase: 'wagon dens',
      };

      const returnedPromise = registerDelegate(
        activePeer, data.username, data.secret, data.secondSecret);
      expect(typeof returnedPromise.then).to.be.equal('function');
    });
  });

  describe('vote', () => {
    it('should return a promise', () => {
      const voteList = [{
        username: 'genesis_1',
        publicKey: 'sample_publicKey_1',
      }];
      const unvoteList = [{
        username: 'genesis_2',
        publicKey: 'sample_publicKey_2',
      }];
      const promise = vote(null, secret, publicKey, voteList, unvoteList, secondSecret);
      expect(typeof promise.then).to.be.equal('function');
    });
  });

  describe('voteAutocomplete', () => {
    it('should return requestToActivePeer(activePeer, `delegates/`, data)', () => {
      // const delegates = [
      //   { username: 'genesis_42' },
      //   { username: 'genesis_44' },
      // ];
      const votedDict = { genesis_3: { confirmed: true, unconfirmed: false, publicKey: 'sample_key' } };
      // peersMock.expects('get').withArgs(activePeer, 'delegates/', { search: username })
      //   .returnsPromise().resolves({ success: true, data: delegates });

      const returnedPromise = voteAutocomplete(activePeer, username, votedDict);
      expect(typeof returnedPromise.then).to.be.equal('function');
    });
  });
});
