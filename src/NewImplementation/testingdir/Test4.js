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
            Takes as input a set of words and stores them for future use in HTML5 localStorage using API. Values are stored under "block_words"
        */
        function save_block(words){
            if (typeof(Storage) !== "undefined") { //checks whether storage is valid on the browser
                
                //concat words into a string for storage
                string_words = "";
                for(var i=0; i<words.length;i++){
                    string_words += words[i] + ",";
                }
                string_words = string_words.substr(0,string_words.length-1);
                
                localStorage.setItem("block_words",string_words);
            } else {
                console.log("No Web Storage support..");
            }
        }
        
        /*
            Loads from HTML5 storage the set of block words previously defined by the user. Returns an array of words.
        */
        function load_block(){
            if (typeof(Storage) !== "undefined") {//checks whether storage is valid on the browser
                string_words = localStorage.getItem("block_words");
                var words = string_words.split(",");
                return words;
                
            } else {
                console.log("No Web Storage support..");
                return null;
            }
        }
            
        //END FUNCTION


        //TESTS
        function makeid(maxlen)
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < maxlen; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }
        
        var words = ["hello", "testing","3XA3"];
        
        for (var i=0; i< 999; i++){
            words.push(makeid(9999));
        }
        
        try{
        save_block(words);
        
        setTimeout(function(){
            var loaded_words = load_block();
            if(loaded_words.toString() != words.toString())
                result = "FAIL";
            
            console.log(words);
            console.log(loaded_words);
        },1000);
        
        }catch(err){
            console.log(err.message);
            result = "FAIL (Error):" + err.message;
        }
            
        setTimeout(function(){
        document.getElementById("status").innerHTML = result;
        },2000);
        
        //END TESTS
        
    });
});

