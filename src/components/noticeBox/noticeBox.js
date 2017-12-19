import React from 'react';
import Button from 'react-toolbox/lib/button';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import RelativeLink from '../relativeLink';
import styles from './noticeBox.css';

const NoticeBox = ({ t, account }) => (
  account.isUninitialized ?
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
          &nbsp;&nbsp;
          <a href='https://docs.lisk.io/' target='_blank' rel='noopener noreferrer'>
            <Button primary flat>
              {t('Learn more')}
            </Button>
          </a>
        </div>
      </footer>
    </div> :
    null
);

export default NoticeBox;
