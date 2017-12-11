module.exports = {
  mainnet: { // network name translation t('Mainnet');
    name: 'Mainnet',
    ssl: true,
    port: 10001,
    code: 0,
  },
  testnet: { // network name translation t('Testnet');
    name: 'Testnet',
    testnet: true,
    ssl: true,
    port: 9999,
    code: 1,
  },
  customNode: { // network name translation t('Custom Node');
    name: 'Custom Node',
    custom: true,
    address: 'http://localhost:10000',
    code: 2,
  },
};
