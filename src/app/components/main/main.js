import './main.less';

const UPDATE_INTERVAL_BALANCE = 10000;

app.component('main', {
  template: require('./main.pug')(),
  controllerAs: '$ctrl',
  controller: class main {
    constructor($scope, $rootScope, $timeout, $q, $state, $peers,
      dialog, SendModal, Account) {
      this.$scope = $scope;
      this.$rootScope = $rootScope;
      this.$timeout = $timeout;
      this.$q = $q;
      this.$peers = $peers;
      this.dialog = dialog;
      this.sendModal = SendModal;
      this.$state = $state;
      this.account = Account;

      this.init();
    }

    init(attempts = 0) {
      if (!this.account.get() || !this.account.get().passphrase) {
        // Return to login but keep the state
        this.$rootScope.landingUrl = this.$state.current.name;
        this.$state.go('login');
        return;
      }

      this.$rootScope.prelogged = true;

      this.$peers.setActive(this.account.get());

      this.update()
        .then(() => {
          this.$rootScope.prelogged = false;
          this.$rootScope.logged = true;
          this.checkIfIsDelegate();
        })
        .catch(() => {
          if (attempts < 10) {
            this.$timeout(() => this.init(attempts + 1), 1000);
          } else {
            this.dialog.errorAlert({ text: 'No peer connection' });
            this.$rootScope.logout();
          }
        });

      // Return to landing page if there's any
      this.activeTab = this.$rootScope.landingUrl || 'main.transactions';
      this.$state.go(this.$rootScope.landingUrl || 'main.transactions');
      delete this.$rootScope.landingUrl;
    }

    checkIfIsDelegate() {
      if (this.account.get() && this.account.get().publicKey) {
        this.$peers.active.sendRequest('delegates/get', {
          publicKey: this.account.get().publicKey,
        }, (data) => {
          if (data.success && data.delegate) {
            this.account.set({
              isDelegate: true,
              username: data.delegate.username,
            });
          }
        });
      }
    }

    update() {
      this.$rootScope.reset();
      return this.account.getAccountPromise(this.account.get().address)
        .then((res) => {
          this.account.set({ balance: res.balance });
        })
        .catch((res) => {
          this.account.set({ balance: null });
          return this.$q.reject(res);
        })
        .finally(() => {
          this.$rootScope.timeout = this.$timeout(this.update.bind(this), UPDATE_INTERVAL_BALANCE);
          return this.$q.resolve();
        });
    }
  },
});
