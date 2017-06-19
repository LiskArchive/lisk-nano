app.filter('currency', ($filter) => {
  const options = {
    minimumSignificantDigits: 2,
    maximumSignificantDigits: 7,
  };
  const liskNumber = $filter('liskNumber');
  const formater = new Intl.NumberFormat(navigator.language, options);

  const round = (value, precision) => {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  };

  const formatCurrency = (val, symbol) => {
    switch (symbol) {
      case 'LSK':
        return liskNumber(val);
      case 'BTC':
        return round(val, 10);
      default:
        return formater.format(parseFloat(val).toFixed(2));
    }
  };

  return (input, tickers, symbol) => {
    if (tickers && tickers[symbol]) {
      return formatCurrency(input * tickers[symbol], symbol);
    }
    return formatCurrency(input, symbol);
  };
});
