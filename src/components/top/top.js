import './top.less';

/**
 * Contains some of the important and basic information about the account
 *
 * @module app
 * @submodule top
 */
app.component('top', {
  template: require('./top.pug')(),
  controller: class top {
    constructor($scope, $rootScope, Peers, Account) {
      this.peers = Peers;
      this.account = Account;
      this.$rootScope = $rootScope;

      $scope.$on('accountChange', () => {
        this.totalSendable = this.account.get().balance > 1e7 ?
          this.account.get().balance - 1e7 : 0;
      });
    }

    setCurrency(symbol) {
      this.$rootScope.symbol = symbol;
      if (localStorage) {
        localStorage.setItem('lisk-currency', symbol);
      }
    }
  },
});
