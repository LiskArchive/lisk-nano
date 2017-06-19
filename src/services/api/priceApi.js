const api = 'https://explorer.lisk.io/api';
/**
 * This factory provides methods for requesting the information of
 * Lisk value in other currencies
 *
 * @module app
 * @submodule PriceApi
 */
app.factory('PriceApi', $http => ({
  /**
   * Fetches the price tickers
   *
   * @returns {promise} Api call promise
   */
  getPriceTicker() {
    return $http.get(`${api}/getPriceTicker`);
  },
}));
