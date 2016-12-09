document.addEventListener("DOMContentLoaded", function(event) { 
    document.getElementById("b").addEventListener("click", function(){
        document.getElementById("status").innerHTML = "In Progress";
        var reset = "/TestPath.html"
        var result = "PASS";
        
        //FUNCTION
        /*
            Returns the current window's URL path, as a string.
        */
        function determine_service(){
            return window.location.pathname;
        }


        //TESTS
        var temp = window.location.pathname;
        temp = temp.substr(0,temp.lastIndexOf("/"));
        function makeid()
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }
        
        var expected = [];
        for(var i=0; i<100; i++){
            expected.push(makeid());
        }
        
        for(var i=0; i<100; i++){
            window.location.pathname = expected[i];
            
            if (expected[i].toString() != window.location.pathname)
                result = "FAIL";
        }
        
        window.location.pathname = temp + reset;
        
        setTimeout(function() {
            document.getElementById("status").innerHTML = result;
        }, 2000);
        
        //END TESTS
        
    });
});

