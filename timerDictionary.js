var exports = module.exports = {
    // The global store of the timer id, to support the timer cancellation.
    // It's a dictionary of { "key_event": [ timer_ids ] }
    timers : {},

    // utility functions to remove a given timer id from the key and event
    addTimer: function(key, event, id) {
        var dictKey = key + '_' + event;
        if (!(dictKey in exports.timers)) {
            exports.timers[dictKey] = [];
        }
        exports.timers[dictKey].push(id);
    },

    removeAllTimers: function(key, event) {
        var dictKey = key + '_' + event;
        if (!(dictKey in exports.timers)) {
            exports.timers[dictKey] = [];
            return;
        }
        exports.timers[dictKey].forEach(function(x) {
            clearTimeout(x);
        });
        exports.timers[dictKey] = [];
    },

    removeTimer: function(key, event, id) {
        var dictKey = key + '_' + event;
        var timerIds = exports.timers[dictKey];
        if (timerIds == undefined) {
            console.log('[Warning] Failed to remove ' + id + ' from ' + key + '_' + event + '. ');
            return;
        }
        exports.timers[dictKey] = timerIds.filter(function(x) { return x != id; });
        clearTimeout(id);
    }

};

