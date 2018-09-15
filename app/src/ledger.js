import { app, ipcMain } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'; // eslint-disable-line import/no-extraneous-dependencies
import win from './modules/win';

let ledgerTransport = null;
let ledgerPath = null;
let ledgerConnected = false;


const openLedgerTransport = (path) => {
  if (ledgerTransport) return;
  TransportNodeHid.open(path)
    .then((t) => {
      ledgerTransport = t;
      ledgerPath = path;
    })
    .catch(error => console.error(error)); // eslint-disable-line no-console
};

const closeLedgerTransport = () => {
  if (!ledgerTransport) return;
  ledgerTransport.close();
  ledgerTransport = null;
  ledgerPath = null;
};

setInterval(() => {
  TransportNodeHid.list()
    .then((deviceList) => {
      if (ledgerConnected !== (deviceList.length > 0)) {
        ledgerConnected = deviceList.length > 0;
        if (ledgerConnected) {
          openLedgerTransport(deviceList[0]);
          win.send({ event: 'ledgerConnected', value: null });
        } else {
          closeLedgerTransport();
          win.send({ event: 'ledgerDisconnected', value: null });
        }
      } else if (ledgerTransport && (ledgerPath !== deviceList[0])) {
        // It happens that ledger change device path
        // In this case we close/open the Transport
        closeLedgerTransport();
        openLedgerTransport(deviceList[0]);
      }
    });
}, 1000);

app.on('will-quit', () => {
  closeLedgerTransport();
});

const createCommand = (k, fn) => {
  ipcMain.on(`${k}.request`, (event, ...args) => {
    fn(...args)
      .then(r => ({ success: true, data: r }))
      .catch(e => ({ success: false, error: e }))
      .then(r => event.sender.send(`${k}.result`, r));
  });
};


// eslint-disable-next-line arrow-body-style
createCommand('ledger.createTransport', (k) => {
  if (ledgerTransport) {
    createCommand(`ledger[${k}].send`, (...args) => ledgerTransport.send(...args));
    ipcMain.on(`ledger[${k}].setScrambleKey`, (event, scrambleKey) => {
      ledgerTransport.setScrambleKey(scrambleKey);
      event.returnValue = true;
    });
    return Promise.resolve(ledgerTransport);
  }
  return Promise.reject('No Device Connected');
});
