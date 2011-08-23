/*--------------------------------------------*
 * jQuery-observe
 *--------------------------------------------*
 * Author Emil Kilhage
 * MIT Licensed
 *--------------------------------------------*
 * Last Update: 2011-08-24
 * Version 0.9
 *--------------------------------------------*/
(function ($) {
    "use strict";
    
    var DATA_NAME = "observer",
        DEFAULT_INTERVAL = 0.1;
    
    $.fn.observe = function (interval, callback) {
        if (!$.isFunction(callback)) {
            callback = interval;
            interval = DEFAULT_INTERVAL;
        }
        
        if (typeof interval !== "number") {
            throw "jQuery.observe:: Unable to observe with interval: " + interval;
        }
        
        if (!$.isFunction(callback)) {
            throw "jQuery.observe:: Unable to bind function: " + callback;
        }
        
        return this.each(function () {
            var elem = this,
                ids = $.data(elem, DATA_NAME) || $.data(elem, DATA_NAME, []),
                value = elem.value;
            
            ids.push(setInterval(function () {
                if (value !== elem.value) {
                    value = elem.value;
                    callback.call(elem, elem);
                }
            }, interval));
        });
    };
    
    $.fn.unobserve = function () {
        return this.each(function () {
            var ids = $.data(this, DATA_NAME);
            $.each(ids, function (i, id) {
                clearInterval(id);
            });
        });
    };

}(jQuery));
