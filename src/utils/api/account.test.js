import { expect } from 'chai';
import { mock } from 'sinon';
import { getAccount, setSecondPassphrase, send,
  extractPublicKey, extractAddress } from './account';

describe('Utils: Account', () => {
  const address = '1449310910991872227L';

  describe('getAccount', () => {
    let activePeer;
    let activePeerMock;

    beforeEach(() => {
      activePeer = {
        accounts: {
          get: () => { },
        },
      };
      activePeerMock = mock(activePeer.accounts).expects('get').returnsPromise();
    });

    afterEach(() => {
      activePeerMock.verify();
      activePeerMock.restore();
    });

    it('should return a promise that is resolved when activePeer.accounts.get() resolves one account', () => {
      const account = { address, balance: 0, publicKey: null };
      const response = { data: [account] };

      const requestPromise = getAccount(activePeer, address);
      activePeerMock.resolves(response);
      return expect(requestPromise).to.eventually.eql({
        ...account,
        serverPublicKey: null,
      });
    });

    it('should return a promise that is resolved even when activePeer.accounts.get() resolves no accounts', () => {
      const response = { data: [] };
      const account = { address, balance: 0 };

      activePeerMock.resolves(response);
      const requestPromise = getAccount(activePeer, address);
      return expect(requestPromise).to.eventually.eql(account);
    });

    it('should otherwise return a promise that is rejected', () => {
      const response = { success: false };

      activePeerMock.rejects(response);
      const requestPromise = getAccount(activePeer, address);
      return expect(requestPromise).to.eventually.be.rejectedWith(response);
    });
  });

  describe('setSecondPassphrase', () => {
    it('should return a promise', () => {
      const promise = setSecondPassphrase();
      expect(typeof promise.then).to.be.equal('function');
    });
  });

  describe('send', () => {
    it('should return a promise', () => {
      const promise = send();
      expect(typeof promise.then).to.be.equal('function');
    });
  });

  describe('extractPublicKey', () => {
    it('should return a Hex string from any given string', () => {
      const passphrase = 'field organ country moon fancy glare pencil combine derive fringe security pave';
      const publicKey = 'a89751689c446067cc2107ec2690f612eb47b5939d5570d0d54b81eafaf328de';
      expect(extractPublicKey(passphrase)).to.be.equal(publicKey);
    });
  });

  describe('extractAddress', () => {
    it('should return the account address from given passphrase', () => {
      const passphrase = 'field organ country moon fancy glare pencil combine derive fringe security pave';
      const derivedAddress = '440670704090200331L';
      expect(extractAddress(passphrase)).to.be.equal(derivedAddress);
    });

    it('should return the account address from given public key', () => {
      const publicKey = 'a89751689c446067cc2107ec2690f612eb47b5939d5570d0d54b81eafaf328de';
      const derivedAddress = '440670704090200331L';
      expect(extractAddress(publicKey)).to.be.equal(derivedAddress);
    });
  });
});
