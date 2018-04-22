import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import HwDiscovery from './hwDiscovery';
import { activePeerSet } from '../../actions/peers';
import { accountSwitched } from '../../actions/savedAccounts';
import { infoToastDisplayed, errorToastDisplayed } from '../../actions/toaster';

const mapStateToProps = state => ({
  account: state.account,
  activePeer: state.peers.data,
  networkOptions: state.peers.options,
});

const mapDispatchToProps = dispatch => ({
  activePeerSet: data => dispatch(activePeerSet(data)),
  accountSwitched: data => dispatch(accountSwitched(data)),
  errorToastDisplayed: data => dispatch(errorToastDisplayed(data)),
  infoToastDisplayed: data => dispatch(infoToastDisplayed(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate()(HwDiscovery));
