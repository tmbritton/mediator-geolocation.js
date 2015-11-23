var mediator = require('mediator.js');

module.exports = (function(){

  var geo = {
    geoAvailable: false,
    options: {
      enableHighAccuracy: false,
      timeout: Infinity,
      maximumAge: 0
    },

    /**
     * Check if geolocation is available in the navigator object.
     * @return {boolean} - True if geolocation is available, false if not. Emits events for each case. 
     */
    checkForGeoLocation: function() {
      if (typeof navigator != 'undefined' && 'geolocation' in navigator) {
        mediator.publish('geolocationAvailable', null);
        geo.geoAvailable = true;
        return true;
      }
      mediator.publish('geolocationUnavailable', null);
      return false;
    },

    /**
     * Get location if navigator.geolocation is available.
     * @param {object} options - PositionOptions object - https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
     */
    getLocation: function(options) {
      // Make sure we've checked to make sure geoLocation is available.
      if (!geo.geoAvailable && !geo.checkForGeoLocation) {
        return;
      }
      if (typeof options != 'object') {
        // These are the default defaults.
        // https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
        options = geo.options;
      }
      navigator.geolocation.getCurrentPosition(
        function geolocationSuccess(position){
          mediator.publish('geolocationSuccess', position);
        }, 
        function geolocationError(error) {
          mediator.publish('geolocationError', error);
          // Some finer-tuned error events.
          switch(error.code) {
            case 1:
              mediator.publish('geolocationErrorPermissionDenied', error);
              break;
            case 2:
              mediator.publish('geolocationErrorPositionUnavailable', error);
              break;
            case 3:
              mediator.publish('geolocationErrorTimeout', error);
              break;    
          }
        },
        options
      );
    },

    /**
     * Get geo position and watch for changes. Emits events as position updates.
     * @param {object} options - PositionOptions object - https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
     */
    watchLocation: function(options) {
      // Make sure we've checked to make sure geoLocation is available.
      if (!geo.geoAvailable && !geo.checkForGeoLocation) {
        return;
      }
      if (typeof options != 'object') {
        // These are the default defaults.
        // https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
        options = geo.options;
      }
      var watchId = navigator.geolocation.watchPosition(
        function watchLocationSuccess(position){
          mediator.publish('geolocationWatchLocationSuccess', position);
        },
        function watchLocationError(error) {
          mediator.publish('geolocationWatchError', error);
          // Some finer-tuned error events.
          switch(error.code) {
            case 1:
              mediator.publish('geolocationWatchErrorPermissionDenied', error);
              break;
            case 2:
              mediator.publish('geolocationWatchErrorPositionUnavailable', error);
              break;
            case 3:
              mediator.publish('geolocationWatchErrorTimeout', error);
              break;    
          }
        },
        options
      );
      if (watchId) {
        mediator.publish('geolocationWatchHandlerEstablished', watchId);
      }
    },

    init: function() {
      geo.checkForGeoLocation();
    }
  };

  return {
    init: geo.init,
    getLocation: geo.getLocation,
    watchLocation: geo.watchLocation
  };

})();