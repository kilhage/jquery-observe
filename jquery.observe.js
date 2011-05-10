/*--------------------------------------------*
 * jQuery-observe
 *--------------------------------------------*
 * Author Emil Kilhage
 * MIT Licensed
 *--------------------------------------------*
 * Last Update: 2011-05-11
 * Version 0.8
 *--------------------------------------------*/
/*jslint browser: true*/
/*global jQuery */
(function ($, undefined) {
    "use strict";
    
    var INTERVAL = 0.3,
        DATA_NAME = "__observer",
        EVENT_NAME = "observe",
        DEFAULT_PROPERTY = "value",
        initializeObserver,
        types = ["__defineGetter__", "defineProperty", "timer"];
    
    function Observer(object) {
        var properties = {},
            // jslint complains that observer isn't 
            // defined without this line, stupid...
            observer;

        observer = {
            add: function (property, fn) {
                if (!observer.has(property)) {
                    properties[property] = initializeObserver(object, property);
                }

                if (fn) {
                    $(object).bind(EVENT_NAME + "." + property, fn);
                }

                return observer;
            },
            remove: function (property, fn) {
                if (observer.has(property)) {
                    properties[property].remove();
                    delete properties[property];
                }

                if (fn) {
                    $(object).unbind(EVENT_NAME + "." + property, fn);
                }

                return observer;
            },
            has: function (property) {
                return properties.hasOwnProperty(property);
            }
        };

        return observer;
    }
    
    function get(elem) {
        return $.data(elem, DATA_NAME);
    }
    
    function trigger(object, property, prev_val) {
        setTimeout(function () {
            $(object).trigger(EVENT_NAME + "." + property, [prev_val]);
        }, 0);
    }
    
    $.fn.observe = function (property, fn) {
        if (!fn) {
            fn = property;
            property = DEFAULT_PROPERTY;
        }
        return this.bind(EVENT_NAME + "." + property, fn);
    };
        
    $.fn.unobserve = function (property, fn) {
        property = property || DEFAULT_PROPERTY;
        return this.unbind(EVENT_NAME + "." + property, fn);
    };
    
    $.each(["unobserve", "observe"], function (i, name) {
        $[name] = function (object, property, fn) {
            $(object)[name](property, fn);
            return get(object);
        };
    });

    $.Observer = Observer;
    
    Observer.get = get;
    Observer.timer = Observer.using = undefined;
    Observer.types = $.merge([], types);
    Observer.INTERVAL = INTERVAL;
    Observer.changeDefaultProperty = function (prop) {
        DEFAULT_PROPERTY = prop;
    };
    
    $.event.special.observe = {
        setup: function () {
            $.data(this, DATA_NAME, Observer(this));
        },        
        teardown: function () {
            $.removeData(this, DATA_NAME);
        }
    };
    
    $.each({remove: "unbind", add: "bind"}, function (special, action) {
        $.event.special.observe[special] = function (info) {
            var observer = $.data(this, DATA_NAME), 
                property = info.namespace;
            
            if (!property) {
                property = DEFAULT_PROPERTY;
                $(this)[action](EVENT_NAME + "." + DEFAULT_PROPERTY, info.handler);
            }
            
            if (observer) {
                observer[special](property);
            }
        };
    });
    
    initializeObserver = (function () {
        var defineProperty = $.isFunction(Object.defineProperty), o = {},
            defineGetter = $.isFunction(o.__defineGetter__),
            objects = [],
            OBJECT = 0,
            PROPERTIES = 1,
            NUMBER_OF_PROPERTIES = 2;
        
        function start() {
            Observer.timer = setInterval(function () {
                var l = objects.length, i = 0, properties, property;
                for (; i < l; i++) {
                    properties = objects[i][PROPERTIES];
                    for (property in properties) {
                        properties[property]();
                    }
                }
            }, INTERVAL);
        }

        function destroy() {
            clearInterval(Observer.timer);
            Observer.timer = undefined;
        }
        
        if (defineProperty || defineGetter) {
            Observer.using = types[defineProperty ? 1 : 0];
            return function (object, property) {
                var value = object[property],
                    disabled = false;
                
                function set(val) {
                    var prev_val = value;
                    value = val;
                    if (disabled === false && prev_val != val) {
                        trigger(object, property, prev_val);
                    }
                }
                
                function get() {
                    return value;
                }
                
                if (defineGetter) {
                    object.__defineSetter__(property, set);
                    object.__defineGetter__(property, get);
                } else {
                    Object.defineProperty(object, property, {set: set, get: get});
                }
                
                return {
                    remove: function () {
                        disabled = true;
                    }
                };
            };
        } else {
            Observer.using = types[2];
                
            return function (object, property) {
                var i = objects.length,
                    properties,
                    value = object[property],
                    index = i, 
                    row;

                while (i--) {
                    row = objects[i];
                    if (row[OBJECT] === object) {
                        properties = row[PROPERTIES];
                        index = i - 1;
                        break;
                    }
                }

                if (properties === undefined) {
                    properties = {};
                    row = [object, properties, 0];
                    objects.push(row);
                }

                row[NUMBER_OF_PROPERTIES]++;

                properties[property] = function () {
                    if (object[property] != value) {
                        var prev_val = value;
                        value = object[property];
                        trigger(object, property, prev_val);
                    }
                };

                // Start the timer that checks if any properties are changed
                if (Observer.timer === undefined) {
                    start();
                }

                return {
                    remove: function () {
                        if (properties.hasOwnProperty(property)) {
                            // Remove the property from the watch list
                            delete properties[property];
                            // If the object doesn't have any properties that
                            // are observed, we don't need to 
                            // store a reference to it any more
                            if (--row[NUMBER_OF_PROPERTIES] === 0) {
                                objects.splice(index);
                                // If we aren't observing any objects
                                // We can destroy the timer
                                if (objects.length === 0) {
                                    destroy();
                                }
                            }
                        }
                    }
                };
            };
        }
    }());

}(jQuery));
