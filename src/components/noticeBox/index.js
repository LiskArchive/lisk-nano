import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import NoticeBox from './noticeBox';

const mapStateToProps = state => ({
  transactions: state.transactions,
  account: state.account,
});

export default connect(
  mapStateToProps,
)(translate()(NoticeBox));

