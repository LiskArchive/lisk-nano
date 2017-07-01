const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

describe('Factory: Logout', () => {
  let $timeout;
  let $rootScope;
  let logout;

  beforeEach(angular.mock.module('app'));

  beforeEach(inject((_Logout_, _$timeout_, _$rootScope_) => {
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    logout = _Logout_;
  }));

  describe('init()', () => {
    it('should call $rootScope.logout after $timeout', () => {
      const spy = sinon.spy($rootScope, 'logout');
      logout._initTimer(); //eslint-disable-line
      $timeout.flush();
      expect(spy).to.have.been.calledWith();
    });

    it('should call $timeout.cancel on _cleraTimer', () => {
      logout.timerId = 100;
      const spy = sinon.spy($timeout, 'cancel');
      logout._clearTimer(); //eslint-disable-line
      expect(spy).to.have.been.calledWith();
      expect(logout.timerId).to.be.equal(null);
    });
  });
});
