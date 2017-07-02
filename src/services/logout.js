const TEN_MINUTES = 600000;

/**
 * @description This factory provides functionality to auto logout user after long idling
 *
 * @module app
 * @submodule Logout
 */
app.factory('Logout', ($window, $rootScope, $timeout, Notification) => {
  /**
   *The Logout factory constructor class
   * @class Logout
   * @constructor
   */
  class Logout {
    constructor() {
      this.timerId = null;
      this.$rootScope = $rootScope;
      this.notify = Notification;
    }

    /**
     * Inititalize event listeners
     *
     * @method init
     * @memberof Logout
     */
    init() {
      if (PRODUCTION) {
        const { ipc } = $window;
        ipc.on('blur', () => this._initTimer());
        ipc.on('focus', () => this._clearTimer());
      }
    }

    /**
     * @private
     * @memberof Logout
     */
    _initTimer() {
      this.timerId = $timeout(() => {
        this.notify.about('logout');
        this.$rootScope.logout();
      }, TEN_MINUTES);
    }

    /**
     * @private
     * @memberof Logout
     */
    _clearTimer() {
      $timeout.cancel(this.timerId);
      this.timerId = null;
    }
  }

  return new Logout();
});
