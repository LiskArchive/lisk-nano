const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);
const API = 'https://explorer.lisk.io/api';

describe('Factory: PriceApi', () => {
  let priceApi;
  let $http;

  beforeEach(angular.mock.module('app'));

  beforeEach(inject((_$http_, _PriceApi_) => {
    priceApi = _PriceApi_;
    $http = _$http_;
  }));

  describe('priceApi.getPriceTicker', () => {
    it('should call $http.get', () => {
      const spy = sinon.spy($http, 'get');
      priceApi.getPriceTicker();
      expect(spy).to.have.been.calledWith(`${API}/getPriceTicker`);
    });
  });
});
