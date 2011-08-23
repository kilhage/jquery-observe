
test("simple input field", function(){
    
    stop();
  
    var input = $("<input type='text' value='0' />").observe(function() {
        ok(true);
    }).observe(function() {
        ok(true);
        start();
        
    }).get(0);
    
    setTimeout(function(){
        
        input.value += "1";
        
    }, 1);
    
});

test("simple plain object", function(){
    stop();
    
    var o = {};
    
    $(o).observe(function() {
        ok(true);
    }).observe(function() {
        ok(true);
    }).observe(function() {
        ok(true);
    }).observe(function() {
        ok(true);
        $(o).unobserve();
        start();
    });
    
    o.value = "dew";
});
