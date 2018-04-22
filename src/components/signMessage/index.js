import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { successToastDisplayed, errorToastDisplayed, infoToastDisplayed } from '../../actions/toaster';
import SignMessage from './signMessage';

const mapStateToProps = state => ({
  account: state.account,
});

const mapDispatchToProps = dispatch => ({
  successToast: data => dispatch(successToastDisplayed(data)),
  infoToast: data => dispatch(infoToastDisplayed(data)),
  errorToast: data => dispatch(errorToastDisplayed(data)),
  copyToClipboard: (message, options) => copy(message, options),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate()(SignMessage));
