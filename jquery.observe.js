/*--------------------------------------------*
 * jQuery-observe, Sherlock holmes is watching..
 *--------------------------------------------*
 * Author Emil Kilhage
 * MIT Licensed
 *--------------------------------------------*
 * Last Update: 2011-03-22
 * Version x
 *--------------------------------------------*/
(function($, undefined) {

$.fn.extend({
    
    /**
     * Initalizes a observer
     * 
     * @param <string> property
     * @param <number> interval
     * @param <function> callback
     * @param <boolean> strict
     * @return <jQuery instance>
     */
    observe: function(property, interval, callback, strict) {
        return this.each(function() {
            $.observe(this, property, interval, callback, strict);
        });
    },
    
    /**
     * 
     * @param <string> property
     * @return <jQuery instance>
     */
    unobserve: function(property) {
        return this.each(function() {
            $.unobserve(this, property);
        });
    }
    
});

$.extend({

    /**
     * 
     * @param <object> object: the object that should be observed
     * @param <string> property: name of the property
     * @param <number> interval: the interval
     * @param <function> callback: callback function
     * @param <boolean> strict
     * @return <jQuery.observer instance> if the object is observable, else undefined
     */
    observe: function(object, property, interval, callback, strict) {
        
        if ( ! callback ) {
            callback = interval;
            interval = property;
            property = $.observer.DEFAULT_PROPERTY;
        }
        
        if ( ! callback ) {
            callback = interval;
            interval = $.observer.DEFAULT_INTERVAL;
        }
        
        if ( typeof callback === "string" ) {
            var action = callback;
            callback = function() {
                return $(this).trigger(action, slice.call(arguments, 1));
            };
        }
        
        if ( ! callback ) return undefined;

        var observer = $.observer.init(object);

        if ( ! $.observer.isObserver(observer) ) return undefined;

        return observer.add(property, interval, callback, strict);
    },
    
    /**
     * 
     * @param <object> object
     * @param <string> property
     * @return void
     */
    unobserve: function(object, property) {
        var observer = $.observer.get(object);

        if ( ! $.observer.isObserver(observer) ) return;
        
        observer.clear(property);
    },
    
    /**
     * Constructor for the Observer object
     * This is bound to all obejcts that is 
     * observed and will contins all timed property observers
     *
     * @param <object> element: an instance of jQuery or an object
     */
    observer: function(element) {
        var self = this;
        self.$elem = element instanceof $ ? element : $(element);
        self.elem = self.$elem[0];
        self.timers = {};
    }
    
});

$.extend($.observer, {
    
    /* ============== Constants, you could change these if you like ============== */
    
    // The lowest interval that could be observed
    MIN: 0.5,
    
    // The default property name
    DEFAULT_PROPERTY: "value",
    
    // The default interval
    DEFAULT_INTERVAL: 1,
    
    // The event/data-namespace
    DATA_NAME: "observer",
    
    /* ========================== Public Helper Methods ========================== */
    
    /**
     * Initalizes the $.observer if it already isn't bound to the object
     *
     * @param <object> object
     * @return <jQuery.observer instance> if the object is observable, else undefined.
     */
    init: function(object) {
        if ( ! $.observer.observable(object) ) return undefined;

        var observer = $.observer.get(object);
        
        if ( ! $.observer.isObserver(observer) ) {
            observer = $.data(object, $.observer.DATA_NAME, new $.observer(object));
        }
        
        return observer;
    },
    
    /**
     * Returns the instanceof $.observer if it where somehow bound to the object.
     * 
     * If a string is given, it will be treated as a selector.
     * 
     * if a plain object, dom node or an instance of jQuery is given
     * The observer instance will be extracted with the $.data function
     * 
     * If something that isn't observable is given, 
     * or if the instance isn't found by the $.data function, undefined will be returned
     * 
     * @param <mixed> object
     * @return <jQuery.observer instance> if success, else <undefined>.
     */
    get: function(object) {
        return typeof object === "string" ? 
            $.observer.get($(object)) : 
                $.observer.observable(object) ? 
                ($.observer.isObserver(object) ? 
                    object : 
                    $.data(object instanceof $ ? object[0] : object, $.observer.DATA_NAME)) :
            undefined;
    },

    /**
     * Checks if given property is an instance of the $.observer.property object
     * 
     * @param prop
     * @return <boolean>
     */
    isProperty: function(prop) {
        return prop instanceof $.observer.property;
    },

    /**
     * Checks if given property is an instance of the $.observer object
     * 
     * @param prop
     * @return <boolean>
     */
    isObserver: function(prop) {
        return prop instanceof $.observer;
    },

    /**
     * Checks if given property is observable
     * 
     * Allows plain objects and dom-nodes
     * 
     * @param prop
     * @return <boolean>
     */
    observable: function(prop) {
        return !!(prop && (prop.nodeType || $.type(prop) === "object"));
    },

    /**
     * Constructor for the $.observer.property object
     * 
     * @param <object> $elem
     * @param <string> property
     * @param <number> interval
     * @param <function> callback
     * @param <boolean> strict
     */
    property: function($elem, property, interval, callback, observer, strict) {
        var self = this;
        self.observer  = observer;
        self.property  = property;
        self.interval  = interval = getInterval(interval);
        self.event_name += property+"."+interval;
        self.$elem     = $elem instanceof $ ? $elem : $($elem);
        self.$elem     = $elem;
        self.elem      = $elem[0];
        self.prevVal   = self.getValue();
        self.bind(callback);
        self.changed = strict === true ? 
            $.observer.property.strictChanged : 
            $.observer.property.changed;
        
        if ( support.sgett ) {
            initSGetters(self.elem, property, self);
        } else {
            self.timer = setInterval(function() {self.check(self.getValue());}, interval);
        }
        
    },
    
    /* ========================== $.observer Instance Methods ========================== */
    
    prototype: {
        
        /**
         * Initalizes a new timed property observer to the object
         * if an observer with the same interval hasn't been initalized.
         * If thats the case, the callback will just be bound to the event
         *
         * @param <string> property
         * @param <number> interval
         * @param <function> callback
         * @param <boolean> strict
         * @return self
         */
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
        
        /**
         * Binds an callback to an property observer
         * 
         * @param <string> property: name of the property that you whant to bind the callback to
         * @param <function> callback: callback function
         * @return self
         */
        bind: function(property, callback) {
            var timers = this.timers[property], interval;
            if ( timers ) {
                for( interval in timers ) {
                    timers[interval].bind(callback);
                }
            }
            return this;
        },

        /**
         * Destructs the timed property observers in this object
         * if property is passed, only this will be destructed
         * otherwise, everything will be destructed
         * 
         * @param <string> property
         * @return self
         */
        clear: function(property) {
            if ( typeof property === "string" ) {
                clearProperty(this, property);
            } else {
                for ( property in this.timers ) {
                    clearProperty(this, property);
                }
            }
            return this;
        }

    }
    
});

$.extend($.observer.property, {
    
    // One of these will be set on the $.observer.property instance when it get initalized
    // depending on if the strict param is set to true or not.
    
    changed: function() {
        return this.prevVal != this.curVal;
    },

    strictChanged: function() {
        return this.prevVal !== this.curVal;
    },
    
    /* =========== $.observer.property Instance Methods =========== */
    
    prototype: {
        
        // Number of times the property have changed
        i: 0,
        // The event name that is bound to the object
        event_name: $.observer.DATA_NAME+".",
        
        /**
         * @return the value of the property in the object
         */
        getValue: function() {
            return this.elem[this.property];
        },
        
        /**
         * 
         * @return void
         */
        check: function(val) {
            var self = this;
            self.curVal = val;
            if ( self.changed() ) {
                self.i++;
                self._trigger();
                self.prevVal = self.curVal;
                delete self.curVal;
            }
        },
        
        /**
         * Triggers the property observe event
         * 
         * @return self
         */
        _trigger: function() {
            var self = this;
            self.$elem.trigger(self.event_name, [self.prevVal, self.curVal, self]);
            return self;
        },
        
        /**
         * Binds an callback to the observe event
         * 
         * @param <function> callback
         * @return self
         */
        bind: function(callback) {
            this.$elem.bind(this.event_name, callback);
            return this;
        },
        
        /**
         * Unbinds the event to the element and stops 
         * the timed observation for the property in the object
         * 
         * @return self
         */
        clear: function() {
            this.check = $.noop;
            clearInterval(this.timer);
            this.$elem.unbind(this.event_name);
            return this;
        }

    }

});

/* ================================ Private helpers ================================ */

/**
 * Fixes bad input
 * 
 * @param <mixed> interval
 * @return <number float>
 */
function getInterval(interval) {
    if ( typeof interval !== "number" ) {
        interval = parseFloat(interval);
    }
    return interval != interval || interval < $.observer.MIN ? $.observer.MIN : interval;
}

/**
 * 
 * @param <jQuery.observer instance> self
 * @param <string> property
 * @return void
 */
function clearProperty(self, property) {
    var timers = self.timers[property], interval;
    if ( timers ) {
        for ( interval in timers ) {
            timers[interval].clear();
        }
        delete self.timers[property];
    }
}

function initSGetters(e, name, self) {
    var val;
    self._set = e.__lookupSetter__(name) || $.noop;
    self._get = e.__lookupGetter__(name) || $.noop;

    e.__defineSetter__(name, function(value) {
        val = value;
        self.check(value);
        return self._set.apply(this, arguments);
    });

    e.__defineGetter__(name, function() {
        self._get.apply(this, arguments);
        return val;
    });
}

var slice = Array.prototype.slice;

/* ================================ Support ================================ */

var support = (function() {
    
    var s = {
        sgett: false
    };
    
    $.each({
        object_sgett: {},
        element_sgett: document.createElement("input")
    }, function(name, e) {
        if ( !e.__lookupSetter__ || !e.__defineGetter__ ) return;
        
        var val;
        try {
            e.value = "1";

            var set = e.__lookupSetter__("value") || $.noop;
            var get = e.__lookupGetter__("value") || $.noop;

            e.__defineSetter__("value", function(value){
                val = value;
                set.apply(this, arguments);
            });

            e.__defineGetter__("value", function(){
                get.apply(this, arguments);
                return "3";
            });

            e.value = "2";

            s.sgett = s.sgett && e.value === "3" && val === "2";
        } catch(e) {
            s.sgett = false;
        }
    });
    
    return s;
    
}());

}(jQuery));
