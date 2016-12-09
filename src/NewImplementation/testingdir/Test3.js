document.addEventListener("DOMContentLoaded", function(event) { 
    document.getElementById("b").addEventListener("click", function(){
        document.getElementById("status").innerHTML = "In Progress";
        var result = "PASS";
        
        //Sample Settings Packet
        var settings_packet = (function(my){
            my.reqblock = null;
            my.reqreplace = null;
            my.filternames = null;
            my.c_mute = false;
            return my;
        }(settings_packet || {}));
        
        //FUNCTION
        
        /*
            Takes as input a set of posts and data to inject, then injects data into the loaded DOM elements identified as posts.
        */
        function inject(posts, data){
            for (var i=0; i<posts.length; i++){
                if(settings_packet.c_mute==false){ //only inject new content when muting is disabled
                    posts[i].innerHTML = null;
                    p = document.createElement("p");
                    p.innerHTML = data;
                    posts[i].appendChild(p);
                }
            }
        }


        //TESTS
        function makeid() //retruns random strings
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }
        
        var posts = document.getElementsByClassName("userContentWrapper");
        var postcontent = makeid();
        
        inject(posts, postcontent);
        
        var posts_after = document.getElementsByClassName("userContentWrapper");
        
        for(var i=0; i<posts_after.length; i++){
            var content = posts_after[i].getElementsByTagName("p")[0];
            if (content.innerHTML != postcontent)
                result = "FAIL";
        }
        
        setTimeout(function() {
            document.getElementById("status").innerHTML = result;
        }, 1000);
        
        //END TESTS
        
    });
});

