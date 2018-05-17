import React from 'react';
import Input from 'react-toolbox/lib/input';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
import FontIcon from 'react-toolbox/lib/font_icon';
import { fromRawLsk, toRawLsk } from '../../utils/lsk';
import AuthInputs from '../authInputs';
import ActionBar from '../actionBar';
import { authStatePrefill, authStateIsValid } from '../../utils/form';

import styles from './send.css';

class Send extends React.Component {
  constructor() {
    super();
    this.state = {
      recipient: {
        value: '',
      },
      amount: {
        value: '',
      },
      reference: {
        value: '',
      },
      fee: 0.1,
      ...authStatePrefill(),
    };
    this.inputValidationRegexps = {
      recipient: /^\d{1,21}[L|l]$/,
      amount: /^\d+(\.\d{1,8})?$/,
    };
  }

  componentDidMount() {
    const newState = {
      recipient: {
        value: this.props.recipient || '',
      },
      amount: {
        value: this.props.amount || '',
      },
      ...authStatePrefill(this.props.account),
    };
    this.setState(newState);
  }

  handleChange(name, value, error) {
    const fee = (name === 'reference' && value.length > 0) ?
      0.2 : 0.1;
    this.setState({
      fee,
      [name]: {
        value,
        error: typeof error === 'string' ? error : this.validateInput(name, value),
      },
    });
  }

  validateInput(name, value) {
    if (!value && name !== 'reference') {
      return this.props.t('Required');
    } else if (!value.match(this.inputValidationRegexps[name])) {
      return this.props.t('Invalid');
    } else if (name === 'amount' && value > parseFloat(this.getMaxAmount())) {
      return this.props.t('Insufficient funds');
    } else if (name === 'amount' && value === '0') {
      return this.props.t('Zero not allowed');
    } else if (name === 'reference' && value.length > 64) {
      return this.props.t('Maximum length of 64 characters is exceeded.');
    }
    return undefined;
  }

  send(event) {
    event.preventDefault();
    this.props.sent({
      activePeer: this.props.activePeer,
      account: this.props.account,
      recipientId: this.state.recipient.value,
      amount: this.state.amount.value,
      passphrase: this.state.passphrase.value,
      secondPassphrase: this.state.secondPassphrase.value,
      data: this.state.reference.value,
    });
    this.setState({ executed: true });
  }

  getMaxAmount() {
    return fromRawLsk(Math.max(0, this.props.account.balance - toRawLsk(this.state.fee)));
  }

  setMaxAmount() {
    this.handleChange('amount', this.getMaxAmount());
  }

  render() {
    return (
      <div className={`${styles.send} send`}>
        <form onSubmit={this.send.bind(this)}>
          <Input label={this.props.t('Recipient Address')} required={true}
            className='recipient'
            autoFocus={true}
            error={this.state.recipient.error}
            value={this.state.recipient.value}
            onChange={this.handleChange.bind(this, 'recipient')} />
          <Input label={this.props.t('Transaction Amount')} required={true}
            className='amount'
            error={this.state.amount.error}
            value={this.state.amount.value}
            onChange={this.handleChange.bind(this, 'amount')} />
          <Input
            label={this.props.t('Reference')}
            required={false}
            className='reference'
            error={this.state.reference.error}
            value={this.state.reference.value}
            onChange={this.handleChange.bind(this, 'reference')} />
          {this.state.reference.value.length > 0 ? <div>
            <FontIcon className={styles.notice} value='error_outline' />
            {this.props.t('Using a reference will cost an additional fee of 0.1 LSK. Your total transaction fee will be 0.2 LSK if you choose to use a reference.')}
          </div> : null }
          <AuthInputs
            passphrase={this.state.passphrase}
            secondPassphrase={this.state.secondPassphrase}
            onChange={this.handleChange.bind(this)} />
          <div className={styles.fee}> {this.props.t('Fee: {{fee}} LSK', { fee: this.state.fee })} </div>
          <IconMenu icon='more_vert' position='topRight' menuRipple className={`${styles.sendAllMenu} transaction-amount`} >
            <MenuItem onClick={this.setMaxAmount.bind(this)}
              caption={this.props.t('Set maximum amount')}
              className='send-maximum-amount'/>
          </IconMenu>
          <ActionBar
            secondaryButton={{
              onClick: this.props.closeDialog,
            }}
            primaryButton={{
              label: this.props.t('Send'),
              type: 'submit',
              disabled: (
                this.state.executed ||
                !!this.state.recipient.error ||
                !this.state.recipient.value ||
                !!this.state.amount.error ||
                !this.state.amount.value ||
                !authStateIsValid(this.state)),
            }} />
        </form>
      </div>
    );
  }
}

export default Send;
