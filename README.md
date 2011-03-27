[jQuery-observe](https://github.com/kilhage/jquery.observe)
================================

About
----------------------------
* MIT Licensed
* Last Updated: 2011-03-22
* Version x
* Author Emil Kilhage

This plugin is used to observe changes in property values in objects and elements.

It takes advantage of ecma script 5's Object.defineProperty or __defineSetter__ 
whenever any of these are available and falls back at an timed observer(In older browsers like IE6, IE7) that checks if the property has been changed in an interval that you specify.

This can be used to observe changes in any property in any plain-object or html-element really easy.

Usage:
----------------------------

There are many ways to initalize these observers, the easiest ways is through an jQuery instance.
´$("#id").observe()´

Like almost all jQuery instance methods this returns the instance to maintain chainability.

Basic usage:

Html:

`<input type="text" value="" id="observed_field" />`

Javascript:
<pre>

$("#observed_field").observe(1, function(event, previous_value, current_value, handler) {
    // The context will be the html-element
});

</pre>

You are also able to observe plain objects in the same way:

If you send in a string as the first argument, this will be
the name of the property to observe, if the first argument is a number(like in the first example), 
the $.observer.DEFAULT_PROPERTY property will be observed.
By default this is set to "value"

<pre>

var object = {
    property: 1
};

var callback = function(event, previous_value, current_value, handler) {
    // The context will be the object
};

$(object).observe("property", 1, callback);

object.property = 2; // Will trigger the callback

</pre>

If you don't specify an interval, the $.observer.DEFAULT_INTERVAL constant will be used instead
By default, this is set to 1, if you want to change this, you could set this to whatever you want

<pre>

$(object).observe(callback);

object.value = "yadayada"; // Will trigger the callback

</pre>

If you send in a string instead of a callback function, 
this event will be linked to the observer event.

<pre>

$("#id").bind("change", function(event, previous_value, current_value, handler){
    // Do something awesome
});

$("#id").observe(1, "change");

</pre>

You can also use the $.observe function to achieve the same thing basically.

<pre>

var object = {};

$.observe(object, "property", 1, callback);

object.property = 2; // Will trigger the callback

</pre>

You also have the possibility to unbind the observers

<pre>

// Will destroy all observers on the #observed_field field
$("#observed_field").unobserve();

var object = {};

$(object).observe(1, function(){});
$(object).observe("prop", 1, function(){});

// destroys the observer for the "prop" property and maintains the rest
$(object).unobserve("prop");

// You can also do like this...

$.unobserve(object, "prop");

$.unobserve(object);

</pre>
