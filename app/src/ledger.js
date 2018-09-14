import { ipcMain } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'; // eslint-disable-line import/no-extraneous-dependencies


const createCommand = (k, fn) => {
  ipcMain.on(`${k}.request`, (event, ...args) => {
    fn(...args)
      .then(r => ({ success: true, data: r }))
      .catch(r => ({ success: false, error: r.message }))
      .then(r => event.sender.send(`${k}.result`, r));
  });
};


// eslint-disable-next-line arrow-body-style
createCommand('ledger.createTransport', (k) => {
  return TransportNodeHid.create()
    .then((t) => {
      createCommand(`ledger[${k}].send`, (...args) => t.send(...args));
      ipcMain.once(`ledger[${k}].setScrambleKey`, (event, scrambleKey) => {
        t.setScrambleKey(scrambleKey);
        event.returnValue = true;
      });
      return null;
    });
});
