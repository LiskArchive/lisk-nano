import React from 'react';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import loginTypes from '../../constants/loginTypes';

import { TooltipWrapper } from '../timestamp';
import styles from './account.css';

const getStatusTooltip = (props) => {
  switch (props.loginType) {
    case loginTypes.passphrase:
      if (props.secondPublicKey) {
        return props.t('This account is protected by a second passphrase');
      } else if (props.passphrase) {
        return props.t('Passphrase of the account is saved till the end of the session.');
      }
      return props.t('Passphrase of the account will be required to perform any transaction.');
    case loginTypes.ledgerNano:
      return props.t('Your Ledger Nano will be required to perform any transaction.');
    case loginTypes.trezor:
      return props.t('Your Trezor will be required to perform any transaction.');
    default:
      return props.t('Login Type not recognized.');
  }
};

const getClassTooltip = (props) => {
  switch (props.loginType) {
    case loginTypes.passphrase:
      return props.passphrase && !props.secondPublicKey ? 'lock_open' : 'lock';
    case loginTypes.ledgerNano:
    case loginTypes.trezor:
      return 'dock';
    default:
      return 'lock';
  }
};

const Address = (props) => {
  const title = props.isDelegate ? props.t('Delegate') : props.t('Address');
  const content = (props.isDelegate && props.delegate) ?
    (<div>
      <p className="inner primary delegate-name">
        {props.delegate.username}
      </p>
      <p className="inner secondary address">
        <span>{props.address}</span>
      </p>
    </div>)
    : (<p className="inner primary full address">
      {props.address}
    </p>);

  return (
    <div className={`box ${styles['text-center']}`}>
      <div className={`${grid.row}`}>
        <div className={`${grid['col-sm-12']} ${grid['col-xs-4']}`}>
          <h3 id="firstBox" className={styles.title}>{title}</h3>
        </div>
        <div className={`${grid['col-sm-12']} ${grid['col-xs-8']}`}>
          <div className={styles['value-wrapper']}>
            {content}
            <span className="status">
              <TooltipWrapper tooltip={getStatusTooltip(props)}>
                <i className="material-icons">{getClassTooltip(props)}</i>
              </TooltipWrapper>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
