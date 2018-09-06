import React from 'react';
import Input from 'react-toolbox/lib/input';
import Lisk from 'lisk-elements';
import InfoParagraph from '../infoParagraph';
import SignVerifyResult from '../signVerifyResult';
import AuthInputs from '../authInputs';
import ActionBar from '../actionBar';
import { authStatePrefill, authStateIsValid } from '../../utils/form';
import loginTypes from '../../constants/loginTypes';
import signPrefix from '../../constants/signPrefix';
import { signMessageWithLedger } from '../../utils/ledger';
import { loadingStarted, loadingFinished } from '../../utils/loading';
import to from '../../utils/to';

class SignMessageComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      message: { value: '' },
      result: '',
      ...authStatePrefill(),
    };
  }

  componentDidMount() {
    this.setState({
      ...authStatePrefill(this.props.account),
    });
  }

  handleChange(name, value, error) {
    this.setState({
      [name]: {
        value,
        error,
      },
      result: undefined,
    });
  }

  /* eslint-disable prefer-const */
  async sign(message) {
    loadingStarted('signMessageWithLedger');
    let error;
    let signedMessage;
    // Add prefix to message:
    const messageToSign = signPrefix + message;
    switch (this.props.account.loginType) {
      case loginTypes.passphrase:
        signedMessage = Lisk.cryptography.signMessageWithPassphrase(messageToSign,
          this.state.passphrase.value);
        this.showResult(message, signedMessage.signature);
        break;

      case loginTypes.ledgerNano:
        [error, signedMessage] = await to(signMessageWithLedger(this.props.account, messageToSign));

        if (error) {
          const text = error && error.message ? `${error.message}.` : this.props.t('An error occurred while creating the transaction.');
          this.props.errorToast({ label: text });
        } else {
          this.showResult(message, signedMessage);
        }
        break;

      case loginTypes.trezor:
        this.props.infoToast({ label: this.props.t('Trezor not yet supported.') });
        break;
      default:
        this.props.errorToast({ label: this.props.t('Login Type not recognized.') });
        break;
    }
    loadingFinished('signMessageWithLedger');
  }

  showResult(message, signature) {
    const result = Lisk.cryptography.printSignedMessage(
      { message, signature, publicKey: this.props.account.publicKey });
    this.setState({ result });
    const copied = this.props.copyToClipboard(result, {
      message: this.props.t('Press #{key} to copy'),
    });
    if (copied) {
      this.props.successToast({ label: this.props.t('Result copied to clipboard') });
    }
  }

  executeSign(event) {
    event.preventDefault();
    this.sign(this.state.message.value);
  }

  render() {
    return (
      <div className='sign-message'>
        <InfoParagraph>
          {this.props.t('Signing a message with this tool indicates ownership of a privateKey (secret) and provides a level of proof that you are the owner of the key. Its important to bear in mind that this is not a 100% proof as computer systems can be compromised, but is still an effective tool for proving ownership of a particular publicKey/address pair.')}
          <br />
          {this.props.t('Note: Digital Signatures and signed messages are not encrypted!')}
        </InfoParagraph>
        <form onSubmit={this.executeSign.bind(this)} id='signMessageForm'>
          <section>
            <Input className='message' multiline label={this.props.t('Message')}
              autoFocus={true}
              value={this.state.message.value}
              onChange={this.handleChange.bind(this, 'message')} />
            <AuthInputs
              passphrase={this.state.passphrase}
              secondPassphrase={this.state.secondPassphrase}
              onChange={this.handleChange.bind(this)} />
          </section>
          {this.state.result ?
            <SignVerifyResult result={this.state.result} title={this.props.t('Result')} /> :
            <ActionBar
              secondaryButton={{
                onClick: this.props.closeDialog,
              }}
              primaryButton={{
                label: this.props.t('Sign and copy result to clipboard'),
                className: 'sign-button',
                type: 'submit',
                disabled: (!this.state.message.value ||
                  this.state.result ||
                  !authStateIsValid(this.state, this.props.account)),
              }} />
          }
        </form>
      </div>
    );
  }
}

export default SignMessageComponent;
