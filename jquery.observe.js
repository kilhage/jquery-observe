/*--------------------------------------------*
 * 
 *--------------------------------------------*
 * Author Emil Kilhage
 * MIT Licensed
 *--------------------------------------------*
 * Last Update: 2011-03-22
 * Version x
 *--------------------------------------------*/
(function($, undefined){

var slice = Array.prototype.slice;

$.fn.extend({
    
    observe: function(property, interval, callback, strict) {
        
        if ( ! callback ) {
            callback = interval;
            interval = property;
            property = $.observer.DEFAULT_PROPERTY;
        }
        
        if ( typeof callback === "string" ) {
            var action = callback;
            callback = function() {
                return $(this).trigger(action, slice.call(arguments, 1));
            };
        }
        
        return this.each(function() {
            $.observe(this, property, interval, callback, strict);
        });

    },
    
    unobserve: function(property) {
        return this.each(function() {
            $.unobserve(this, property);
        });
    }
    
});

$.extend({
    
    observe: function(object, property, interval, callback, strict) {
        if ( ! $.observer.observable(object) ) return undefined;

        if ( ! callback ) {
            callback = interval;
            interval = property;
            property = $.observer.DEFAULT_PROPERTY;
        }

        var observer = $.observer.init(object);

        if ( ! $.observer.isObserver(observer) ) return undefined;

        return observer.add(property, interval, callback, strict);
    },
    
    unobserve: function(object, property) {
        if ( ! $.observer.observable(object) ) return;
        
        var observer = $.observer.get(object);

        if ( ! $.observer.isObserver(observer) ) return;

        observer.clear(property);
    },
    
    observer: function(element) {
        this.elem = element;
        this.$elem = $(element);
        this.timers = {};
    }
    
});

$.extend($.observer, {
    
    MIN: 0.5,
    data_name: "observer",
    DEFAULT_PROPERTY: "value",
    
    init: function(object) {
        if ( ! $.observer.observable(object) ) return undefined;

        var observer = $.observer.get(object);

        if ( ! $.observer.isObserver(observer) ) {
            observer = $.data(object, $.observer.data_name, new $.observer(object));
        }
        
        return observer;
    },
    
    get: function(object) {
        return $.observer.observable(object) ? 
            ($.observer.isObserver(object) ? object : $.data(object, $.observer.data_name)) :
            undefined;
    },

    isProperty: function(prop) {
        return prop instanceof $.observer.property;
    },

    isObserver: function(prop) {
        return prop instanceof $.observer;
    },

    observable: function(prop) {
        var typo = typeof prop;
        return prop && (typo === "object" || typo === "function");
    },

    property: function($elem, property, interval, callback, observer, strict) {
        var self = this;
        self.event_name += property;
        self.observer  = observer;
        self.property  = property;
        self.interval  = getInterval(interval);
        self.$elem     = $elem;
        self.elem      = $elem[0];
        self.prevVal   = self.getValue();
        self.bind(callback);
        self.changed = strict === true ? strictChanged : changed;
        self.timer = setInterval(function() {self.check();}, self.interval);
    },
    
    prototype: {
    
        add: function(property, interval, callback, strict) {
            var self = this, timers = self.timers[property];

            if ( ! timers ) {
                timers = self.timers[property] = {};
            } else if ( $.observer.isProperty(timers[interval]) ) {
                timers[interval].bind(callback);
                return self;
            }

            timers[interval] = new $.observer.property(self.$elem, property, interval, callback, self, strict);

            return self;
        },

        bind: function(property, callback) {
            var timers = this.timers[property], interval;
            if ( timers ) {
                for( interval in timers ) {
                    timers[interval].bind(callback);
                }
            }
            return this;
        },

        clear: function(property) {
            if ( typeof property === "string" ) {
                this._clearProperty(property);
            } else {
                for ( property in this.timers ) {
                    this._clearProperty(property);
                }
            }
            return this;
        },

        _clearProperty: function(property) {
            var timers = this.timers[property], interval;
            if ( timers && timers.hasOwnProperty(property) ) {
                for ( interval in timers ) {
                    if ( $.observer.isProperty(timers[interval]) ) {
                        timers[interval].clear();
                    }
                }
            }
            return this;
        }

    }
    
});

$.observer.property.prototype = {
    
    i: 0,
    event_name: $.observer.data_name+".",
    
    getValue: function() {
        return this.elem[this.property];
    },
    
    check: function() {
        var self = this;
        self.curVal = self.getValue();
        if ( self.changed() ) {
            self.i++;
            self._trigger();
            self.prevVal = self.curVal;
            delete self.curVal;
        }
    },
    
    _trigger: function() {
        var self = this;
        self.$elem.trigger(self.event_name, [self.prevVal, self.curVal, self]);
        return self;
    },

    bind: function(callback) {
        this.$elem.bind(this.event_name, callback);
        return this;
    },
    
    clear: function() {
        clearInterval(this.timer);
        this.$elem.unbind(this.event_name);
        return this;
    }
    
};

function getInterval(interval) {
    if ( typeof interval !== "number" ) {
        interval = parseFloat(interval);
    }
    return interval < $.observer.MIN ? $.observer.MIN : interval;
}

var changed = function() {
    return this.prevVal != this.curVal;
};

var strictChanged = function() {
    return this.prevVal !== this.curVal;
};

}(jQuery));
