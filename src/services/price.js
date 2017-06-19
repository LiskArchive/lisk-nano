app.factory('Price', ($rootScope, PriceApi) => {
  class Price {
    constructor() {
      $rootScope.$on('syncTick', this._getData.bind(this));
    }
    init() {
      this._getData();
      return this;
    }
    _getData() {
      PriceApi.getPriceTicker().then(({ data }) => this._update(data));
    }

    _update(data) {// eslint-disable-line
      const { tickers: { LSK } } = data;
      $rootScope.tickers = LSK;
    }
  }
  return new Price();
});
