document.addEventListener("DOMContentLoaded", function(event) { 
    document.getElementById("b").addEventListener("click", function(){
        document.getElementById("status").innerHTML = "In Progress";
        var result = "PASS";
        
        //Sample Settings Packet
        var settings_packet = (function(my){
            my.reqblock = null;
            my.reqreplace = null;
            my.filternames = null;
            my.c_mute = true;
            return my;
        }(settings_packet || {}));
        
        //FUNCTION
        
        /*
            Takes as input a set of posts, and removes posts from the loaded DOM
        */
        function remove_posts(posts){
            for (var i=0; i<posts.length; i++){
                if(settings_packet.c_mute==true){ //check to ensure muting is enabled
                    posts[i].innerHTML = null;
                    posts[i].parentNode.removeChild(posts[i]);
                }
            }
        }


        //TESTS
        var posts = document.getElementsByClassName("userContentWrapper");
        remove_posts(posts);
        
        if(document.body.childElementCount!=4)
            result = "FAIL";
        
        setTimeout(function() {
            document.getElementById("status").innerHTML = result;
        }, 1000);
        
        //END TESTS
        
    });
});

