/**
 *
 * @author Emil Kilhage 
 */

plugin("jQuery.observer");

module("Internal", 100000);

test("$.observer.get('selector')", function(i) {
    while(i--) {
        $.observer.get('#id');
    }

});

test("$.observer.get({})", function(i) {
    var ob = {};
    while(i--) {
        $.observer.get(ob);
    }

});

test("$.observer.get(domNode)", function(i) {
    var domNode = document.createElement("input");
    while(i--) {
        $.observer.get(domNode);
    }

});

test("$.observer.get(jQuery instance)", function(i) {
    var ob = $(document.createElement("input"));
    while(i--) {
        $.observer.get(ob);
    }

});

test("$.observer.get(jQuery.observer instance)", function(i) {
    var ob = $.observer.init(document.createElement("input"));
    while(i--) {
        $.observer.get(ob);
    }

});

test("$.observer.observable(domNode)", function(i) {
    var ob = document.createElement("input");
    while(i--) {
        $.observer.observable(ob);
    }
});

test("$.observer.observable({})", function(i) {
    var ob = {};
    while(i--) {
        $.observer.observable(ob);
    }
});

test("$.observer.init({})", function(i) {
    var ob = {};
    while(i--) {
        $.observer.init(ob);
    }
});

test("$.observer.init(domNode)", function(i) {
    var ob = document.createElement("input");
    while(i--) {
        $.observer.init(ob);
    }
});
