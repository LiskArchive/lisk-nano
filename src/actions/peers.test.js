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
    let getNetHashMock;

    beforeEach(() => {
      dispatch = spy();
      // TODO: this doesn't work because Lisk.APIClient is called with 'new'
      getNetHashMock = stub(Lisk, 'APIClient').returns({
        node: {
          getConstants: new Promise((resolve) => {
            resolve({ data: { nethash } });
          }),
        },
      });
    });

    afterEach(() => {
      getNetHashMock.restore();
    });

    it('dispatch activePeerSet action also when address http missing', () => {
      const network = {
        address: 'localhost:8000',
        nethash: Lisk.constants.MAINNET_NETHASH,
      };

      activePeerSet({ passphrase, network })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.address', 'localhost:8000'));
    });

    it('dispatch activePeerSet action with mainnet nodes if network.address is undefined', () => {
      activePeerSet({ passphrase, network: {} })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', Lisk.constants.MAINNET_NODES));
    });

    it('dispatch activePeerSet action with mainnet nodes if network is undefined', () => {
      activePeerSet({ passphrase })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', Lisk.constants.MAINNET_NODES));
    });

    it('dispatch activePeerSet action with testnet nodes if testnet option is set', () => {
      const network = {
        testnet: true,
      };

      activePeerSet({ passphrase, network })(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', Lisk.constants.TESTNET_NODES));
    });

    // skipped because I don't know how to stub liskAPIClient.node.getConstants()
    it.skip('dispatch activePeerSet action with custom node', () => {
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

      activePeerSet(data)(dispatch);

      expect(dispatch).to.have.been.calledWith(match.hasNested('data.options.nodes', [data.network.address]));
    });
  });
});
