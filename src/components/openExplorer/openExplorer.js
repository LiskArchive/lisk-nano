const LINK = {
  testnet: 'https://testnet-explorer.lisk.io',
  main: 'https://explorer.lisk.io',
};

/**
 * a directive to open data in Lisk explorer
 */
app.directive('openExplorer', (Account, $window) => {
  const getHost = () => {
    const { network } = Account.get();
    return network.testnet ? LINK.testnet : LINK.main;
  };

  const openExplorer = (url) => {
    if (PRODUCTION) {
      const { shell } = $window;
      shell.openExternal(url);
    } else {
      window.open(url);
    }
  };

  const linkFunc = ($scope, $element) => {
    $element.bind('click', () => {
      openExplorer(`${getHost()}${$scope.url}${$scope.openExplorer}`);
    });
  };

  return {
    scope: {
      url: '=',
      openExplorer: '@',
    },
    link: linkFunc,
  };
});
