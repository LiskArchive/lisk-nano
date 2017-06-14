const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

describe('Open explorer directive', () => {
  let $scope;
  let $window;
  let compiled;
  let account;
  const template = '<div><button type="button" data-open-explorer="/block/1"></button></div>';
  const LINK = {
    testnet: 'https://testnet-explorer.lisk.io',
    main: 'https://explorer.lisk.io',
  };

  beforeEach(angular.mock.module('app'));

  beforeEach(inject(($compile, $rootScope, _Account_, _$window_) => {
    $scope = $rootScope.$new();
    $window = _$window_;
    account = _Account_;
    compiled = $compile(template)($scope);

    $scope.$digest();
  }));

  it('should render directive', () => {
    const el = compiled.find('button');
    expect(el.length).to.equal(1);
  });

  it('should open Lisk explorer when clicked', () => {
    const el = compiled.find('button');
    account.set({
      network: {},
    });
    const spy = sinon.spy($window, 'open');
    el.triggerHandler('click');
    expect(spy).to.have.been.calledWith(`${LINK.main}/block/1`);
    spy.restore();
  });

  it('should open testnet Lisk explorer when clicked', () => {
    const el = compiled.find('button');
    account.set({
      network: {
        testnet: true,
      },
    });
    const spy = sinon.spy($window, 'open');
    el.triggerHandler('click');
    expect(spy).to.have.been.calledWith(`${LINK.testnet}/block/1`);
    spy.restore();
  });
});
