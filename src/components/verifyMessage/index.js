import { translate } from 'react-i18next';
import Input from 'react-toolbox/lib/input';
import React from 'react';
import lisk from 'lisk-elements';
import signPrefix from '../../constants/signPrefix';

import InfoParagraph from '../infoParagraph';
import SignVerifyResult from '../signVerifyResult';

class VerifyMessage extends React.Component {
  constructor() {
    super();
    this.state = {
      publicKey: {
        error: '',
        value: '',
      },
      signature: {
        error: '',
        value: '',
      },
      message: {
        error: '',
        value: '',
      },
      result: '',
    };
  }

  handleChange(name, value) {
    const newState = this.state;
    newState[name].value = value;
    this.setState(this.verify(newState));
  }

  verify(newState) {
    newState.publicKey.error = '';
    newState.signature.error = '';
    newState.result = '';

    if (!this.state.message.value || !this.state.signature.value || !this.state.publicKey.value) {
      return newState;
    }

    try {
      const messageToVerify = signPrefix + this.state.message.value;
      newState.result = lisk.cryptography.verifyMessageWithPublicKey({
        message: messageToVerify,
        signature: this.state.signature.value,
        publicKey: this.state.publicKey.value,
      });
      if (!newState.result) {
        newState.signature.error = this.props.t('Invalid');
      }
    } catch (e) {
      newState.signature.error = this.props.t('Invalid');
      newState.result = '';
    }
    return newState;
  }

  render() {
    const { t } = this.props;
    const result = this.state.result ? t('Message verified') : t('Message not verified');
    return (
      <div className='verify-message'>
        <InfoParagraph>
          {t('When you have the signature, you only need the publicKey of the signer in order to verify that the message came from the right private/publicKey pair. Be aware, everybody knowing the signature and the publicKey can verify the message. If ever there is a dispute, everybody can take the publicKey and signature to a judge and prove that the message is coming from the specific private/publicKey pair.')}
        </InfoParagraph>
        <section>
          <Input className='message' type='text' multiline label={t('Message')}
            autoFocus="true"
            value={this.state.message.value}
            error={this.state.message.error}
            onChange={this.handleChange.bind(this, 'message')} />
          <Input className='public-key' type='text' label={t('Public Key')}
            value={this.state.publicKey.value}
            error={this.state.publicKey.error}
            onChange={this.handleChange.bind(this, 'publicKey')} />
          <Input className='signature' multiline label={t('Signature')}
            value={this.state.signature.value}
            error={this.state.signature.error}
            onChange={this.handleChange.bind(this, 'signature')} />
        </section>
        {this.state.result !== '' ?
          <SignVerifyResult result={result} title={t('Status')} /> :
          null
        }
      </div>
    );
  }
}

export default translate()(VerifyMessage);
