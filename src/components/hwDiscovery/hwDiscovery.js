import { IconButton } from 'react-toolbox/lib/button';
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table';
import React from 'react';
import InfoParagraph from '../infoParagraph';
import ActionBar from '../actionBar';
import { fromRawLsk } from '../../utils/lsk';
import votingConst from '../../constants/voting';
import loginTypes from '../../constants/loginTypes';
import { getLedgerAccountInfo } from '../../utils/api/ledger';
import { loadingStarted, loadingFinished } from '../../utils/loading';

import styles from './hwDiscovery.css';


class HwDiscovery extends React.Component {
  constructor() {
    super();
    this.state = {
      hwAccounts: [],
      isLoading: false,
      showNextAvailable: false,
    };
  }

  componentWillMount() {
    this.setState({ isLoading: true });
  }

  /* eslint-disable no-await-in-loop */
  async componentDidMount() {
    let index = 0;
    let accountInfo;
    loadingStarted('hwDiscovery');
    do {
      try {
        switch (this.props.account.loginType) {
          case loginTypes.ledgerNano:
            accountInfo = await getLedgerAccountInfo(this.props.activePeer, index);
            break;
          case loginTypes.trezor:
            this.props.errorToastDisplayed({ text: this.props.t('Not Yet Implemented. Sorry.') });
            break;
          default:
            this.props.errorToastDisplayed({ text: this.props.t('Login Type not recognized.') });
        }
      } catch (error) {
        loadingFinished('hwDiscovery');
        const text = error && error.message ? `${error.message}.` : this.props.t('Error while retrievieng addresses information.');
        this.props.errorToastDisplayed({ label: text });
        this.props.closeDialog();
        return;
      }

      this.state.hwAccounts.push(accountInfo);
      this.setState({ hwAccounts: this.state.hwAccounts });
      index++;
    }
    while (accountInfo.isInitialized);

    loadingFinished('hwDiscovery');

    this.setState({
      isLoading: false,
      showNextAvailable: (index === 1),
    });
  }

  showNextAvailableWallet() {
    if (this.state.showNextAvailable) {
      this.props.infoToastDisplayed({ label: this.props.t('Please use the last not-initialized account before creating a new one!') });
    } else {
      this.setState({ showNextAvailable: true });
    }
  }

  isActive(hwAccount) {
    return hwAccount.publicKey === this.props.account.publicKey;
  }

  switchAccount(hwAccount, index) {
    const newAccount = {
      publicKey: hwAccount.publicKey,
      activePeer: this.props.activePeer,
      loginType: this.props.account.loginType,
      hwInfo: {
        deviceId: this.props.account.hwInfo.deviceId,
        derivationIndex: index,
      },
      network: this.props.networkOptions.code,
      address: this.props.networkOptions.address,
    };
    this.props.accountSwitched(newAccount);
  }

  render() {
    const { maxCountOfVotes } = votingConst;
    return (
      <div className='hw-discovery'>
        <InfoParagraph>
          {this.props.t('Here you can see all the initialized Lisk Accounts in your Hardware Wallet. You can also create a new one.')}
        </InfoParagraph>
        <br />
        <div className={styles.tableWrapper} >
          <Table selectable={false} className='hw-discovery-table'>
            <TableHead>
              <TableCell className={styles.iconCell} >{this.props.t('Switch')}</TableCell>
              <TableCell>{this.props.t('Index')}</TableCell>
              <TableCell>{this.props.t('Address')}</TableCell>
              <TableCell>{this.props.t('Transactions')}</TableCell>
              <TableCell>{this.props.t('Votes')}</TableCell>
              <TableCell>{this.props.t('Balance')}</TableCell>
            </TableHead>
            {
              this.state.hwAccounts.map((account, index) => (
                (account.unconfirmedBalance ||
                  (!account.unconfirmedBalance && this.state.showNextAvailable)) &&
                <TableRow key={index}
                  className={(this.isActive(account) ? styles.isActive : null)}>
                  <TableCell className={styles.iconCell} >
                    <IconButton icon='exit_to_app'
                      disabled={this.isActive(account)}
                      className='switch-button'
                      onClick={this.switchAccount.bind(this, account, index)} />
                  </TableCell>
                  <TableCell>
                    {index}
                  </TableCell>
                  <TableCell>
                    {account.address}
                    {account.delegate &&
                    <span> ( <strong>{account.delegate.username}</strong> )</span>
                    }
                  </TableCell>
                  <TableCell>
                    {account.txCount ? account.txCount : 0}
                  </TableCell>
                  <TableCell>
                    {account.votesCount ? account.votesCount : 0} / { maxCountOfVotes }
                  </TableCell>
                  <TableCell>
                    {fromRawLsk(account.balance)} LSK
                  </TableCell>
                </TableRow>
              ))
            }
            {
              this.state.isLoading &&
                <TableRow key='loading'>
                  <TableCell colSpan='6' className={styles.iconCellLoading}>
                    {this.props.t('Loading information from your harware wallet...')}
                  </TableCell>
                </TableRow>
            }
          </Table>
        </div>
        <ActionBar
          secondaryButton={{
            onClick: this.props.closeDialog,
          }}
          primaryButton={{
            label: this.props.t('Create a New Lisk Account'),
            type: 'buttom',
            className: 'register-button',
            onClick: this.showNextAvailableWallet.bind(this),
          }} />
      </div>
    );
  }
}

export default HwDiscovery;
