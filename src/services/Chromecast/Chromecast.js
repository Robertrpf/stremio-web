// Copyright (C) 2017-2020 Smart code 203358507

const EventEmitter = require('eventemitter3');
const ChromecastTransport = require('./ChromecastTransport');

let castAPIAvailable = null;
const castAPIEvents = new EventEmitter();
castAPIEvents.on('error', (error) => {
    console.error(error);
});
window['__onGCastApiAvailable'] = function(available) {
    delete window['__onGCastApiAvailable'];
    castAPIAvailable = available;
    castAPIEvents.emit('availabilityChanged');
};

function Chromecast() {
    let active = false;
    let error = null;
    let starting = false;
    let transport = null;

    const events = new EventEmitter();
    events.on('error', (error) => {
        console.error(error);
    });

    function onCastAPIAvailabilityChanged() {
        if (castAPIAvailable) {
            active = true;
            error = null;
            starting = false;
            transport = new ChromecastTransport();
        } else {
            active = false;
            error = new Error('Google Cast API not available');
            starting = false;
            transport = null;
        }

        onStateChanged();
    }
    function onStateChanged() {
        events.emit('stateChanged');
    }

    Object.defineProperties(this, {
        active: {
            configurable: false,
            enumerable: true,
            get: function() {
                return active;
            }
        },
        error: {
            configurable: false,
            enumerable: true,
            get: function() {
                return error;
            }
        },
        starting: {
            configurable: false,
            enumerable: true,
            get: function() {
                return starting;
            }
        },
        transport: {
            configurable: false,
            enumerable: true,
            get: function() {
                return transport;
            }
        }
    });

    this.start = function() {
        if (active || error instanceof Error || starting) {
            return;
        }

        starting = true;
        if (castAPIAvailable !== null) {
            onCastAPIAvailabilityChanged();
        } else {
            castAPIEvents.on('availabilityChanged', onCastAPIAvailabilityChanged);
            onStateChanged();
        }
    };
    this.stop = function() {
        castAPIEvents.off('availabilityChanged', onCastAPIAvailabilityChanged);
        active = false;
        error = null;
        starting = false;
        onStateChanged();
        transport = null;
    };
    this.on = function(name, listener) {
        events.on(name, listener);
    };
    this.off = function(name, listener) {
        events.off(name, listener);
    };
}

module.exports = Chromecast;
