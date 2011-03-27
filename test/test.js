
var log = function() {console.log.apply(console, arguments);};

module("$.observe");

test("simple input", function(){
    
    stop();
  
    var input = $("<input type='text' />").observe("0.4", function() {
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
    
    $.observe(t, 0.7, function(){
        ok(true);
        start();
    });
    
    setTimeout(function(){
        
        t.value = "1";
        
    }, 1);

});

test("simple plain object", function() {
    
    stop();
    
    var t = {};
    
    $.observe(t, "prop", 0.7, function(){
        ok(true);
        start();
    
        $.unobserve(t, "prop");
    });
    
    t.prop = "1";
    
    $(t).observe(0.5, function(){ok(true);}).trigger($.observer.data_name+".value").unobserve("value");

});

test("simple", function(){
    stop();
    var o = {};
    
    $(o).observe(function() {
        ok(true);
        start();
        $.unobserve(o);
    });
    
    o.value = "dew"

});

module("$.unobserve");

test("all", function(){
    expect(0);
    stop();
    
    var a = {};
    
    $.observe(a, 0.6, function() {
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
    
    $.observe(a, 0.6, function() {
        ok(false, "unable to onobserve");
    });
    
    setTimeout(function(){
        
        a.value = "1sss";
        start();
        
    }, 3);
    
    $.unobserve(a, "value");

});

module("internal");

test("$.observer.observable", function(){
    
    $.each([null, function(){}, undefined, /cdscds/, "", "fsdcds", [], 1, 0.2, true, false, NaN], function(i, p){
        equal($.observer.observable(p), false, $.type(p)+"::"+String(p)+":: should not be observable" );
    });
    
    $.each([{}, document.createElement("a")], function(i, p){
        equal($.observer.observable(p), true, $.type(p)+"::"+String(p)+":: should be observable" );
    });
    
});
