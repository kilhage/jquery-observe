
var log = function() {console.log.apply(console, arguments);};

$(function(){
    $("#qunit-header").append(" With" + (!$.Observer.usingTimer ? "out" : "") + " timer");
    if (!$.Observer.usingTimer) {
        $("#qunit-header").append(", unsing: " + $.Observer.using)
    }
});

test("Binding an observer directly using jQuery's event interface", function () {
   
   stop();
   
   if ($.Observer.usingTimer) {
       ok($.Observer.timer != undefined);
   }
   
   $("#input1").val("0").bind("observe", function (event, prev_val) {
       ok(true);
       equal(prev_val, "0");
       $(this).unbind("observe");
       if ($.Observer.usingTimer) {
           equal($.Observer.timer, undefined);
       }
       start();
       
   }).val("1");
   
});

test("simple input", function(){
    
    stop();
  
    var input = $("<input type='text' />").observe(function() {
        ok(true);
        start();
        
    }).get(0);
    
    setTimeout(function(){
        
        input.value += "1";
        
    }, 1);
    
});

test("simple plain object, std prop", function() {
    
    stop();
    
    var t = {};
    
    $.observe(t, function(){
        ok(true);
        start();
    });
    
    setTimeout(function(){
        
        t.value = "1";
        
    }, 3);

});

test("simple plain object", function() {
    
    stop();
    
    var t = {};
    
    $.observe(t, "prop", function(){
        ok(true);
        start();
    
        $.unobserve(t, "prop");
    });
    
    t.prop = "1";
    
    $(t).observe(function(){
        ok(true);
    }).trigger("observer.value").unobserve("value");

});

test("simple", function(){
    stop();
    var o = {};
    
    $(o).observe(function() {
        ok(true);
        $.unobserve(o);
        start();
    });
    
    o.value = "dew"

});

module("$.unobserve");

test("all", function(){
    expect(0);
    stop();
    
    var a = {};
    
    $.observe(a, function() {
        ok(false, "unable to onobserve");
    });
    
    setTimeout(function(){
        
        a.value = "1sss";
        start();
        
    }, 3);
    
    $.unobserve(a);

});

test("single", function(){
    expect(0);
    stop();
    
    var a = {};
    
    $.observe(a, "value", function() {
        ok(false, "unable to onobserve");
    });
    
    $.unobserve(a, "value");
    
    setTimeout(function () {
        
        a.value = "1sss";
        start();
        
    }, 3);

});
