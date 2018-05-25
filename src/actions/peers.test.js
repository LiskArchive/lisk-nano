import { expect } from 'chai';
import { spy, stub, match } from 'sinon';
import Lisk from 'lisk-elements';
import actionTypes from '../constants/actions';
import { activePeerSet, activePeerUpdate } from './peers';

describe('actions: peers', () => {
  const passphrase = 'wagon stock borrow episode laundry kitten salute link globe zero feed marble';
  const nethash = '198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d';

  describe('activePeerUpdate', () => {
    it('should create an action to update the active peer', () => {
      const data = {
        online: true,
      };

      const expectedAction = {
        data,
        type: actionTypes.activePeerUpdate,
      };
      expect(activePeerUpdate(data)).to.be.deep.equal(expectedAction);
    });
  });

  describe('activePeerSet', () => {
    let dispatch;
    let APIClientBackup;
    let getConstantsMock;

    beforeEach(() => {
      dispatch = spy();
      getConstantsMock = stub().returnsPromise();
      APIClientBackup = Lisk.APIClient;

      // TODO: find a better way of mocking Lisk.APIClient
      Lisk.APIClient = class MockAPIClient {
        constructor() {
          this.node = {
            getConstants: getConstantsMock,
          };
        }
      };
      Lisk.APIClient.constants = APIClientBackup.constants;
    });

    afterEach(() => {
      Lisk.APIClient = APIClientBackup;
    });

    it('dispatch activePeerSet action also when address http missing', () => {
      const network = {
        address: 'localhost:8000',
        nethash: Lisk.APIClient.constants.MAINNET_NETHASH,
      };

      activePeerSet({ passphrase, network })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.address', 'localhost:8000'));
    });

    it('dispatch activePeerSet action with mainnet nodes if network.address is undefined', () => {
      activePeerSet({ passphrase, network: {} })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', Lisk.APIClient.constants.MAINNET_NODES));
    });

    it('dispatch activePeerSet action with mainnet nodes if network is undefined', () => {
      activePeerSet({ passphrase })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', Lisk.APIClient.constants.MAINNET_NODES));
    });

    it('dispatch activePeerSet action with testnet nodes if testnet option is set', () => {
      const network = {
        testnet: true,
      };

      activePeerSet({ passphrase, network })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', Lisk.APIClient.constants.TESTNET_NODES));
    });

    it('dispatch activePeerSet action with custom node', () => {
      const data = {
        passphrase,
        network: {
          name: 'Custom Node',
          custom: true,
          address: 'http://localhost:4000',
          testnet: true,
          nethash,
        },
      };
      getConstantsMock.resolves({ data: { nethash } });

      activePeerSet(data)(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', [data.network.address]));
    });

    it('dispatch error toast action if getConstants() API call fails', () => {
      const data = {
        passphrase,
        network: {
          name: 'Custom Node',
          custom: true,
          address: 'http://localhost:4000',
          testnet: true,
          nethash,
        },
      };
      getConstantsMock.rejects({});

      activePeerSet(data)(dispatch);

      expect(dispatch).to.have.been.calledWith(match.has('type', actionTypes.toastDisplayed));
    });
  });
});
