import { expect } from 'chai';
import Lisk from 'lisk-elements';
import { mock } from 'sinon';
import moment from 'moment';
import { getForgedBlocks, getForgedStats } from './forging';
import { extractAddress } from '../api/account';

describe('Utils: Forging', () => {
  let activePeer;
  const publicKey = 'c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f';

  beforeEach(() => {
    const nethash = '198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d';
    activePeer = new Lisk.APIClient(['http://localhost:4000'], nethash, {});
  });

  describe('getForgedBlocks', () => {
    it('should return a promise', () => {
      const expectedValue = {
        generatorPublicKey: publicKey,
        limit: 20,
        offset: 0,
      };
      const peersMock = mock(activePeer.blocks);
      peersMock.expects('get').withArgs(expectedValue)
        .returnsPromise().resolves('resolved promise');
      const returnedPromise = getForgedBlocks(activePeer, 20, 0, publicKey);
      peersMock.verify();
      peersMock.restore();
      return expect(returnedPromise).to.eventually.equal('resolved promise');
    });
  });

  describe('getForgedStats', () => {
    it('should return a promise', () => {
      const startTime = moment('2016-04-24 17:00');
      const peersMock = mock(activePeer.delegates);
      peersMock.expects('getForgingStatistics').withArgs(extractAddress(publicKey),
        {
          start: moment(startTime).unix(),
          end: moment().unix(),
        })
        .returnsPromise().resolves('resolved promise');
      const promise = getForgedStats(activePeer, startTime, publicKey);
      expect(typeof promise.then).to.be.equal('function');
    });
  });
});
