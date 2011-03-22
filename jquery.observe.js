/*--------------------------------------------*
 * 
 *--------------------------------------------*
 * Author Emil Kilhage
 * MIT Licensed
 *--------------------------------------------*
 * Last Update: 2011-03-22
 * Version x
 *--------------------------------------------*/
(function($){

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
                return $(this).trigger(action, arguments);
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
        return $.observer.init(object).add(property, interval, callback, strict);
    },
    
    unobserve: function(object, property) {
        
        var observer = $.observer.get(object);

        if ( ! (observer instanceof $.observer) ) return;

        observer.clear(property);
        observer = null;

        $.removeData(object, $.observer.data_name);
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
        var observer = $.observer.get(object);

        if ( ! (observer instanceof $.observer) ) {
            observer = $.data(object, $.observer.data_name, new $.observer(object));
        }
        
        return observer;
    },
    
    get: function(object){
        return $.data(object, $.observer.data_name);
    },
    
    property: function($elem, property, interval, callback, observer, strict) {
        var self = this;
        this.event_name += property;
        this.observer  = observer;
        this.property  = property;
        this.interval  = getInterval(interval);
        this.$elem     = $elem;
        this.elem      = $elem[0];
        this.prevVal   = this.getValue();
        this.add(callback);
        this.timer = setInterval(function() {self.check();}, this.interval);
        this.changed = strict === true ? strictChanged : changed;
    },
    
    prototype: {
    
        add: function(property, interval, callback, strict) {
            var timers = this.timers[property];

            if ( ! timers ) {
                timers = this.timers[property] = {};
            } else if ( timers[interval] instanceof $.observer.property ) {
                timers[interval].add(callback);
                return this;
            }

            timers[interval] = new $.observer.property(this.$elem, property, interval, callback, this, strict);

            return this;
        },

        clear: function(property) {
            if ( typeof property == "string" ) {
                this.clearProperty(property);
            } else {
                for ( property in this.timers ) {
                    this.clearProperty(property);
                }
            }
            return this;
        },

        clearProperty: function(property) {
            var timers = this.timers[property], interval;
            if ( timers && timers.hasOwnProperty(property) ) {
                for ( interval in timers ) {
                    if ( timers[interval] instanceof $.observer.property ) {
                        timers[interval].clear();
                    }
                }
                if ( interval && timers[interval] instanceof $.observer.property )
                    this.$elem.unbind(timers[interval].event_name);
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
        this.curVal = this.getValue();
        if ( this.changed() ) {
            this.i++;
            this.trigger();
            this.prevVal = this.curVal;
            delete this.curVal;
        }
    },
    
    trigger: function() {
        this.$elem.trigger(this.event_name, [this.prevVal, this.curVal, this]);
        return this;
    },
    
    add: function(callback) {
        this.$elem.bind(this.event_name, callback);
        return this;
    },
    
    clear: function() {
        clearInterval(this.timer);
        return this;
    }
    
}

function getInterval(interval) {
    if ( typeof interval !== "number" ) {
        interval = parseFloat(interval);
    }
    return interval < $.observer.MIN ? $.observer.MIN : interval;
}

var changed = function() {
    return this.prevVal != this.curVal;
}

var strictChanged = function() {
    return this.prevVal !== this.curVal;
}

}(jQuery));
