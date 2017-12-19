import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import NoticeBox from './noticeBox';

const mapStateToProps = state => ({
  account: state.account,
});

export default connect(mapStateToProps)(translate()(NoticeBox));

