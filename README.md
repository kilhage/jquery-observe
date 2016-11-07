[jQuery-observe](https://github.com/kilhage/jquery.observe)
================================

About
----------------------------
* MIT Licensed
* Last Updated: 2011-08-24
* Version 0.9
* Author Emil Kilhage

Basicly does the same thing as prototypes TimedObserver: http://www.prototypejs.org/api/timedObserver

Usage:
----------------------------

```javascript

jQuery("#id").observe(function (element) {
    // Your callback code, gets called when the field's value changes
});


/**
 * The default interval that the observer checks if the value has been changed is 0.1 ms.
 * If you wan't to change that you can pass that interval as the first:
 */

jQuery("#id").observe(1, function (element) {
    // your callback
});


```

[www.glooby.com](https://www.glooby.com)
[www.glooby.se](https://www.glooby.se)
