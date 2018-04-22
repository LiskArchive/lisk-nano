import { IconButton } from 'react-toolbox/lib/button';
import Tooltip from 'react-toolbox/lib/tooltip';
import React from 'react';
import Input from 'react-toolbox/lib/input';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
import InfoParagraph from '../infoParagraph';
import ActionBar from '../actionBar';
import stepsConfig from './secondPinForHWSteps';
import styles from './secondPinForHW.css';


// eslint-disable-next-line new-cap
const TooltipIconButton = Tooltip(IconButton);

class SecondPinForHW extends React.Component {
  constructor() {
    super();
    this.state = {
      current: 'info',
      inputType: 'password',
      pin: '',
      pincheck: '',
    };
  }

  handlePIN(value) {
    let error;
    if (!value) {
      error = this.props.t('Required');
    } else if (isNaN(value)) {
      error = this.props.t('Only Numeric Value!');
    } else if (value.length < 4) {
      error = this.props.t('At least 4 digits');
    }
    this.setState({
      pin: value,
      error: typeof error === 'string' ? error : undefined,
    });
  }

  handleCheckPIN(value) {
    let error;
    if (value !== this.state.pin) {
      error = this.props.t('PIN is different.');
    }
    this.setState({
      pincheck: value,
      errorcheck: typeof error === 'string' ? error : undefined,
    });
  }

  toggleInputType() {
    this.setState({ inputType: this.state.inputType === 'password' ? 'text' : 'password' });
  }

  render() {
    const templates = {};
    const { current } = this.state;
    const steps = stepsConfig(this);

    const importantReminder = <strong>{this.props.t('If you forget your PIN, your funds on this Lisk Address will not be accessible anymore.')}</strong>;

    // Step 1: Information/introduction about PIN selection
    templates.info = <InfoParagraph>
      {this.props.feeNote}
      {this.props.t('With Hardware Wallet you are going to set a personal numeric PIN that will be used to select a specific secret key in your Hardware Wallet.')}
      <br />
      {this.props.t('This PIN is not related to your Hardware Wallet personal PIN, but it is limited to this particular Lisk Address')}
      <br />
      {importantReminder}
      <br />
      <br />
      {this.props.useCaseNote}
      <br />
      <br />
      {this.props.t('Click Next and create your numeric PIN and keep it in a safe place!')}
    </InfoParagraph>;

    // step 2: Insert PIN
    templates.insert =
      <div>
        <InfoParagraph>
          {this.props.feeNote}
          {importantReminder}
        </InfoParagraph>
        <div className={styles.wrapper}>
          <Input label={this.props.t('Set your PIN (only numerical)')}
            className={`passphrase ${styles.inputWrapper}`}
            type={this.state.inputType}
            value={this.state.pin || ''}
            error={this.state.error}
            required={true}
            autoFocus={true}
            onChange={this.handlePIN.bind(this)} />
          <TooltipIconButton className={`show-passphrase-toggle ${styles.eyeIcon}`}
            tooltipPosition='horizontal'
            tooltip={this.state.inputType === 'password' ?
              this.props.t('Show passphrase') :
              this.props.t('Hide passphrase')}
            icon={this.state.inputType === 'password' ? 'visibility' : 'visibility_off'}
            onClick={this.toggleInputType.bind(this)}/>
        </div>
        <div className={styles.wrapper}>
          <Input label={this.props.t('Confirm Your PIN')}
            className={`passphrase ${styles.inputWrapper}`}
            type={this.state.inputType}
            value={this.state.pincheck || ''}
            error={this.state.errorcheck}
            required={true}
            onChange={this.handleCheckPIN.bind(this)} />
          <TooltipIconButton className={`show-passphrase-toggle ${styles.eyeIcon}`}
            tooltipPosition='horizontal'
            tooltip={this.state.inputType === 'password' ?
              this.props.t('Show passphrase') :
              this.props.t('Hide passphrase')}
            icon={this.state.inputType === 'password' ? 'visibility' : 'visibility_off'}
            onClick={this.toggleInputType.bind(this)}/>
        </div>
      </div>;

    // step 3: Confirm
    templates.confirm =
      <div>
        <InfoParagraph>
          {this.props.feeNote}
          {importantReminder}
          <br />
          <br />
          {this.props.t('By clicking on Register, your Hardware Wallet will ask you to approve to register a PIN for your account')}
          <br />
          <br />
          {this.props.useCaseNote}
        </InfoParagraph>
      </div>;

    return (
      <div>
        <section className={`${styles.templateItem} ${grid.row} ${grid['middle-xs']}`}>
          <div className={grid['col-xs-12']}>
            { templates[current] }
          </div>
        </section>

        <ActionBar
          secondaryButton={{
            label: steps[current].cancelButton.title(),
            onClick: steps[current].cancelButton.onClick.bind(this),
          }}
          primaryButton={{
            label: steps[current].confirmButton.title(),
            fee: steps[current].confirmButton.fee(),
            className: 'next-button',
            disabled: (current === 'insert' && (!this.state.pin || !this.state.pincheck
              || this.state.error !== undefined || this.state.errorcheck !== undefined)),
            onClick: steps[current].confirmButton.onClick.bind(this),
          }} />
      </div>
    );
  }
}

export default SecondPinForHW;
