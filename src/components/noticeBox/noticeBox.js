import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import RelativeLink from '../relativeLink';
import styles from './noticeBox.css';

const NoticeBox = ({ t, account }) => (
  account.isUninitialized && account.balance > 0 ?
    <div className={`box ${styles.wrapper}`}>
      <p>
        {t('This account has not been initialized. It is recommended that you initialize your account by sending an outgoing transaction.')}
      </p>
      <p>
        {t('The easiest and cheapest way to do this is to send LSK to yourself by clicking this button. It will cost you only the usual 0.1 LSK transaction fee.')}
      </p>
      <footer className={ `${grid.row} ${grid['center-xs']}` }>
        <div className={grid['col-xs-12']}>
          <RelativeLink to={`send?amount=1&recipient=${account.address}`}
            className='initialize-account-button' primary raised>
            {t('Initialize account')}
          </RelativeLink>
        </div>
      </footer>
    </div> :
    null
);

export default NoticeBox;
