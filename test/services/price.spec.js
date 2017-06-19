const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

describe('Factory: Price', () => {
  let $rootScope;
  let Price;
  let httpBackend;
  const mockData = {
    tickers: {
      LSK: {
        BTC: '0.00117589',
      },
    },
  };

  beforeEach(angular.mock.module('app'));

  beforeEach(inject((_$rootScope_, _Price_, _$httpBackend_) => {
    $rootScope = _$rootScope_;
    Price = _Price_;
    httpBackend = _$httpBackend_;
    httpBackend.when('GET', 'https://explorer.lisk.io/api/getPriceTicker').respond(mockData);
  }));

  it('should call _update on syncTick event with data from getPriceTicker method', () => {
    const spy = sinon.spy(Price, '_update');
    $rootScope.$emit('syncTick');
    httpBackend.flush();
    $rootScope.$apply();
    expect(spy).to.have.been.calledWith(mockData);
  });
});
