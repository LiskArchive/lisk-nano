import React from 'react';
import { fromRawLsk } from '../../utils/lsk';
import Passphrase from '../passphrase';
import Fees from '../../constants/fees';
import Authenticate from '../authenticate';

const SecondPassphrase = ({
  passphrase, account, peers, registerSecondPassphrase, closeDialog, t,
}) => {
  const onLoginSubmission = (secondPassphrase) => {
    registerSecondPassphrase({
      activePeer: peers.data,
      secondPassphrase,
      account,
    });
  };

  return (
    typeof passphrase === 'string' && passphrase.length > 0 ?
      <Passphrase
        onPassGenerated={onLoginSubmission}
        keepModal={true}
        fee={Fees.setSecondPassphrase}
        closeDialog={closeDialog}
        confirmButton={t('Register')}
        feeNote={
          <div>
            {t('Registering a second passphrase requires ')}
            <b style={{ color: 'black' }}>
              {t(' a fee of {{fee}} LSK.', { fee: fromRawLsk(Fees.setSecondPassphrase) })}
            </b>
            <br /><br />
          </div>
        }
        useCaseNote={t('Note: After the registration is complete, your second passphrase will be required for all outgoing transactions from this account.')} />
      :
      <Authenticate nextAction={t('set second passphrase')} />);
};

export default SecondPassphrase;
