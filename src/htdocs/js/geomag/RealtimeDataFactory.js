'use strict';

var Formatter = require('geomag/Formatter'),
    Model = require('mvc/Model'),
    RealtimeData = require('geomag/RealtimeData'),
    Util = require('util/Util'),
    Xhr = require('util/Xhr');


var _DEFAULT_URL = '/ws/edge/';

var _DEFAULTS = {
  'url': _DEFAULT_URL,
  'starttime': null,
  'endtime': null,
  'channels': ['H','E','Z','F'],
  'freq': 'seconds',
  'temperatureChannels': [
    // TO => UK4
    'UK4',
    // TP => UK2
    'UK2',
    // TE => UK1
    'UK1',
    // TF => UK3
    'UK3']
};


/**
 * Constructor.
 *
 * @param options {Object} observatory attributes.
 * @param options.url {string}
 * @param options.channels {Array<string>}
 * @param options.observatory {Array{string}}
 * @param options.freq {string{seconds|minutes}}
 * @param options.success {callback()}
 */
var RealtimeDataFactory = function (options) {
  var _this,
      _initialize,

      _lastcall;


  _this = Model(Util.extend({}, _DEFAULTS, options));

  _initialize = function () {

    // TODO: this is a hack to deal with
    // https://github.com/usgs/hazdev-webutils/issues/8
    _lastcall = null;
  };


  /**
   * @param options {Object} observatory attributes.
   *        options.???  Same as constructor.
   */
  _this.getRealtimeData = function (options) {
    var _options = Util.extend({}, _this.get(), options);

    // TODO: this is a hack to deal with
    // https://github.com/usgs/hazdev-webutils/issues/8
    if (_lastcall !== null) {
      while (_lastcall === new Date().getTime()) {
        // wait until its not
      }
    }
    _lastcall = new Date().getTime();

    Xhr.ajax({
      url: _options.url,
      data: {
        'starttime': _options.starttime,
        'endtime': _options.endtime,
        'id': _options.observatory,
        'elements': _options.channels.join(','),
        'sampling_period': Formatter.samplingPeriod(_options.freq),
        'format': 'json'
      },
      success: function (data) {
        _options.success(RealtimeData(data));
      },
      error: _options.error
    });
  };

  _this.getRealtimeTemperatureData = function (options) {
    if (options.channels === undefined ){
      options.channels = _DEFAULTS.temperatureChannels;
    }
    if (options.freq === undefined) {
      options.freq = 'minutes';
    }
    _this.getRealtimeData(options);
  };

  _this.destroy = Util.compose(
    // sub class destroy method
    function () {
      // Clean up private variables
      _lastcall = null;

      _this = null;
    },
    // parent class destroy method
    _this.destroy);


  _initialize();
  options = null;
  return _this;
};

module.exports = RealtimeDataFactory;
