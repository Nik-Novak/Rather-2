var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + 'KEY REMOVED'; //Google Could Vision API access link

/*
    Function that is run every 3 seconds, checking if any new content has been laoded onto the page. If so, attempt to mute/replace new content.
*/
var prevsubstreamlength = 0;
setInterval(function(){
    var len;
    var weblen = DetectWebsite.detect();
    weblen = DetectWebsite.parse_address(weblen);
    if(weblen == 1)
        len = document.getElementById("topnews_main_stream_408239535924329").childNodes[0].childNodes[3].childNodes[0].childElementCount;
    else
        len = document.getElementById("pagelet_group_mall").childNodes[0].childNodes[0].childElementCount;
    console.log("new: " + len + " -- old: " + prevsubstreamlength );
    if(len != prevsubstreamlength){
        if(settings_packet.reqblock != null){
            console.log("NEW CONTENT BEING REPLACED");
            FacebookAPI.inject(settings_packet.reqblock, settings_packet.reqreplace);
            console.log("NEW CONTENT DONE REPLACED");
        }
    }
    prevsubstreamlength = len;
}, 3000);



/*
    FacebookAPI module, which handles injection, post identification and otehr features specific to Facebook
*/
var FacebookAPI = (function (my) {

    /*
        Public interface for injecting all posts with content matchign block_text, with content matching replace_text
    */
    my.inject = function(block_text, replace_text){
        replace(block_text, replace_text);
    };
    
    /*
        Public interface for searching for posts within facebook domain
    */
    my.search_posts = function(){
        
    };
    
    function replace(block_text, replace_text){
        var elements = document.getElementsByClassName("userContentWrapper");
        
        var block_words = block_text.split(",");
        replace_text +="";
        var replace_words = replace_text.split(",");
        //Parse Reg Exp for all replacements
        var block_regstr = "";
                    for (var k=0; k < block_words.length-1; k++){
                        block_regstr += "\\b"+block_words[k].trim() + "\\b" + "|";
                    }
                    block_regstr+= "\\b"+block_words[block_words.length-1].trim()+"\\b";
        console.log(block_regstr);
        //end parse
        
        //text pos removal
        var textmarked = mark_remove_text(elements, block_regstr);
        remove_text(textmarked, elements);
        
        block_image(block_regstr); //IMAGES

        console.log("Successfully Replaced");
    }
    
    function mark_remove_text(elements, block_regstr){
        var markremove = [];
        for(var i=0; i<elements.length; i++){
            if (elements[i].hasAttribute("considered-text"))
                continue;
            var ps = elements[i].getElementsByTagName('p');
            var combined = "";
            for(var j=0; j<ps.length; j++){
                combined += ps[j].innerText;
            }
            
            var regexp = new RegExp(block_regstr, "gi");
            var matches = combined.match(regexp);
            if(matches!=null){
                markremove.push(i);
            }
            
            elements[i].setAttribute("considered-text","true");
        }
        return markremove;
    }
    
    function remove_text(textmarked, elements){
        for (var i=0; i<textmarked.length; i++){
            if(FilterFeature.checknames(elements[textmarked[i]]))
                continue;
            
            console.log("ATTENTION-text");
            console.log(settings_packet.c_mute);
            if(settings_packet.c_mute==true){
                elements[textmarked[i]].innerHTML = null;
            }
            else{
            	Content.image(elements[textmarked[i]]);
            }
            
        }
    }
    
    function block_image(block_regstr){
        var elements = document.getElementsByClassName("userContentWrapper");
        for(var i=0; i<elements.length; i++){
            
            if(elements[i].hasAttribute("considered-img"))
                continue;
            
            var img = elements[i].getElementsByTagName("img");
            for( var j=0; j< img.length; j++){
                if(img[j].height <= 50 || img[j].width <=50)
                    continue;
                if(img[j]!=null){
                    Image.getBase64FromImageUrl(img[j].src, i, block_regstr, function(b64code,url, block_regstr, postindex){
                        Image.sendFileToCloudVision(b64code,"LABEL_DETECTION", url, block_regstr, postindex);
                    });
                }
            }
            
                elements[i].setAttribute("considered-img","true");
        }
        
    }

    return my;
}(FacebookAPI || {}));

/*
    A module for anythign related to determining what service the extension is being used on
*/
var DetectWebsite = (function(my){
	my.detect = function(){
		return window.location.pathname;
	};
	
	my.parse_address = function(weburl){
		if(weburl != null)
	        return weburl.length;
	    else
	        return 0;
	};
	return my;
}(DetectWebsite || {}));


/*
    A Module for abstracting content retrieval for injection, for now this module only contains images however it is anticipated to change in the future
*/
var Content = (function(my){
	my.image = function(post){
	    return Image.image_retrieve(post);
	};
	return my;
}(Content || {}));

/*
    A Module for abstracting image content retrieval and image content analysis for the Content module.
*/
var Image = (function(my){
	my.init = function(){
		
	};
	
	my.image_retrieve = function(post){
		var img1 = document.createElement("img");
		chrome.runtime.sendMessage({message_id: "gif_request"}, function(response) {
	        post.innerHTML=null;
	            var img = document.createElement("img");
	            console.log("RESPONSE: ");
	            console.log(response);
	        if(response);
	            img.src = response.gif_url;
	        img.id = "hellotest";
	        img.onload = function () {
	            img.style.width = '100%';
	        };
	        
	        post.appendChild(img);
	});
		return img1;
	};
	
	
	my.getBase64FromImageUrl = function(url, postindex, block_regstr, callback) {
	    //console.log(url);
	    var img = new Image();

	    img.setAttribute('crossOrigin', 'anonymous');

	    img.onload = function () {
	        var canvas = document.createElement("canvas");
	        canvas.width =this.width;
	        canvas.height =this.height;

	        var ctx = canvas.getContext("2d");
	        ctx.drawImage(this, 0, 0);

	        var dataURL = canvas.toDataURL("image/png");

	        var final = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	        callback(final,url, block_regstr, postindex);
	    };

	    img.src = url;
	};


	my.sendFileToCloudVision = function(content, type, scr, block_regstr, postindex) {
	  // Strip out the file prefix when you convert to json.
	  var request = {
	    requests: [{
	      image: {
	        content: content
	      },
	      features: [{
	        type: type,
	        maxResults: 200
	      }]
	    },
	               
	    {
	      image: {
	        content: content
	      },
	      features: [{
	        type: "TEXT_DETECTION",
	        maxResults: 200
	      }]
	    }
	              
	              ]
	  };
	    
	  var xhr = new XMLHttpRequest();
	    var url = CV_URL;
	    xhr.open("POST", url, true);
	    xhr.setRequestHeader("Content-type", "application/json");
	    xhr.onreadystatechange = function () { 
	        if (xhr.readyState == 4 && xhr.status == 200) {
	            var json = JSON.parse(xhr.responseText);
	            console.log(scr);
	            console.log(json);
	            
	            postUpdate(postindex, json, block_regstr);
	        }
	    };
	    
	var data = JSON.stringify(request);
	xhr.send(data);
	};

	function postUpdate(index, json, block_regstr){
	    var elements = document.getElementsByClassName("userContentWrapper");
	    console.log("REMOVE:" + index);
	    console.log("block_regstr: " + block_regstr + " -- json-label: " + json.responses[0].labelAnnotations[0].description );
	    //console.log(json.responses);
	    if(json.responses[1].textAnnotations != null)
	        console.log(json.responses[1].textAnnotations[0].description);
	    
	    var labelAnno = json.responses[0].labelAnnotations;
	    var regexp = new RegExp(block_regstr, "gi");
	    var matchesB = false;
	    for (var i=0; i<labelAnno.length; i++){
	        tag = labelAnno[i].description;
	        var matches = tag.match(regexp);
	        if(matches!=null){
	                matchesB = true;
	            break;
	            }
	    }
	    
	    var matchesB2 = false;
	    
	    if(json.responses[1].textAnnotations != null){
	        
	    var textAnno = json.responses[1].textAnnotations;
	    for (var i=0; i<textAnno.length; i++){
	        tag = textAnno[i].description;
	        var matches = tag.match(regexp);
	        if(matches!=null){
	                matchesB2 = true;
	            break;
	            }
	    }
	        
	    }
	    
	    if(matchesB || matchesB2){
	        console.log("ATTENTION");
	        console.log(settings_packet.c_mute);
	        if(settings_packet.c_mute==true){
	            elements[index].innerHTML=null;
	        }
	        else{
	            Content.image(elements[index]);
	        }
	        
	    }
	};
	return my;
}(Image || {}));

/*
    A Pseudo class settings_packet that allows various modules to read the user's current settings, and make decisions based on the results. Settings include: the list of words to block, the list of words to replace, the list of names to filter and the toggle option of muting or replacing post content.
*/
var settings_packet = (function(my){
	my.reqblock = null;
	my.reqreplace = null;
	my.filternames = null;
	my.c_mute = null;
	return my;
}(settings_packet || {}));

/*
    A module for handling the filtering of custom users.
*/
var FilterFeature = (function(my){
	my.checknames = function(post){
		return safe_listed(post);
	};
	
	function safe_listed(post){
	    var name_container = post.getElementsByClassName("clearfix");
	    var name = name_container[1].getElementsByTagName("a")[0].text;
	    if(name == settings_packet.filternames)
	        return true;
	    return false;
	}
	return my;
}(FilterFeature || {}));

console.log("Tested");

/*
    A message listener for recieving messages from external scripts such as the extension's main script.
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?  //console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.message_id == "submit"){
        console.log("Block Values: " + request.block + "    Replace Values: " + request.replace);
        settings_packet.c_mute = Boolean(request.mute);
        
        //replace_facebook_blank();
      FacebookAPI.inject(request.block, request.replace);
    settings_packet.reqblock = request.block;
    settings_packet.reqreplace = request.replace;
        //test();
    }
  });
