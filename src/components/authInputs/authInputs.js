import React from 'react';
import PassphraseInput from '../passphraseInput';
import { extractPublicKey } from '../../utils/api/account';
import loginTypes from '../../constants/loginTypes';

class AuthInputs extends React.Component {
  componentDidMount() {
    if (this.props.account.secondPublicKey) {
      this.props.onChange('secondPassphrase', '');
    }
  }

  isHW() {
    return this.props.account.loginType !== loginTypes.passphrase;
  }

  onChange(name, value, error) {
    if (!error && this.props.account.loginType === loginTypes.passphrase) {
      const publicKeyMap = {
        passphrase: 'publicKey',
        secondPassphrase: 'secondPublicKey',
      };
      const expectedPublicKey = this.props.account[publicKeyMap[name]];

      if (expectedPublicKey && expectedPublicKey !== extractPublicKey(value)) {
        error = this.props.t('Entered passphrase does not belong to the active account');
      }
    }
    this.props.onChange(name, value, error);
  }

  render() {
    return (
      <span>
        {(!this.props.account.passphrase && !this.isHW() &&
        <PassphraseInput label={this.props.t('Passphrase')}
          className='passphrase'
          error={this.props.passphrase.error}
          value={this.props.passphrase.value}
          onChange={this.onChange.bind(this, 'passphrase')} />)}
        {(this.props.account.secondPublicKey ?
          <PassphraseInput label={this.isHW() ? this.props.t('Personal PIN') : this.props.t('Second Passphrase')}
            className='second-passphrase'
            isHW={this.isHW()}
            error={this.props.secondPassphrase.error}
            value={this.props.secondPassphrase.value}
            onChange={this.onChange.bind(this, 'secondPassphrase')} /> : null)}
      </span>);
  }
}

export default AuthInputs;

