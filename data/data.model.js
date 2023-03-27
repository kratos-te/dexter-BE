class DataModel {
  constructor(
    symbol = [],
    open_date_time = [],
    close = [],
    high = [],
    low = [],
    open = [],
    volume = [],
    num_trades = [],
    taker_base_vol = [],
    taker_quote_vol = []
  ) {
    this.symbol = symbol;
    this.open_date_time = open_date_time;
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.volume = volume;
    this.num_trades = num_trades;
    this.taker_base_vol = taker_base_vol;
    this.taker_quote_vol = taker_quote_vol;
  }
}

module.exports = DataModel;
