var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + 'AIzaSyCa_Co-vDUcs81I8bNw4OuBuBQZhuxlEOY';
var prevRem = [];

var c_mute;

var reqblock,reqreplace;

var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var prevsubstreamlength = 0;
setInterval(function(){
    var len;
    if(window.location.pathname.length == 1)
        len = document.getElementById("topnews_main_stream_408239535924329").childNodes[0].childNodes[3].childNodes[0].childElementCount;
    else
        len = document.getElementById("pagelet_group_mall").childNodes[0].childNodes[0].childElementCount;
    console.log("new: " + len + " -- old: " + prevsubstreamlength )
    if(len != prevsubstreamlength){
        if(reqblock != null){
            console.log("NEW CONTENT BEING REPLACED");
            replace(reqblock, reqreplace);
            console.log("NEW CONTENT DONE REPLACED");
        }
    }
    prevsubstreamlength = len
}, 3000);

function replace(block_text, replace_text){
    prevRem = [];
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
    
    //while(imagesFetching>0)
        //console.log("Looping, imagesFetching = " + imagesFetching );
    
    //remove images here
        
    console.log("Successfully Replaced");
}

function remove_text(textmarked, elements){
    for (var i=0; i<textmarked.length; i++){
        if(safe_listed(elements[textmarked[i]]))
            continue;
        elements[textmarked[i]].innerHTML = null;
        inject_gif(elements[textmarked[i]]);
    }
}

function safe_listed(post){
    var name_container = post.getElementsByClassName("clearfix");
    var name = name_container[1].getElementsByTagName("a")[0].text;
    console.log("NAME *T&*BSHJ GD&* SGBISFH O DS" + name);
    if(name == "Joel Straatman")
        return true;
    return false;
}

function inject_gif(post){
    chrome.runtime.sendMessage({message_id: "gif_request"}, function(response) {
        post.innerHTML=null;
            var img = document.createElement("img");
        if(response!=null);
            img.src = response.gif_url; //--replace image
        img.id = "hellotest";
        img.onload = function () {
            img.style.width = '100%';
        }
        
        post.appendChild(img);
});
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

//********************************IMAGES**************************************

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
                getBase64FromImageUrl(img[j].src, i, block_regstr, function(b64code,url, block_regstr, postindex){
                    //console.log(b64code)
                    sendFileToCloudVision(b64code,"LABEL_DETECTION", url, block_regstr, postindex);
                });
            }
        }
        
            elements[i].setAttribute("considered-img","true");
    }
    
}

function getBase64FromImageUrl(url, postindex, block_regstr, callback) {
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
}


function sendFileToCloudVision (content, type, scr, block_regstr, postindex) {
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
            
            removePost(postindex, json, block_regstr);
        }
    }
    
var data = JSON.stringify(request);
xhr.send(data);
}

function removePost(index, json, block_regstr){
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
        console.log(c_mute);
        if(c_mute==true){
            elements[index].innerHTML=null;
        }
        else{
            inject_gif(elements[index]);
        }
        
    }
}


//****************************************************************************

console.log("Tested");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?  //console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.message_id == "submit"){
        console.log("Block Values: " + request.block + "    Replace Values: " + request.replace);
        c_mute = Boolean(request.mute);
        
        //replace_facebook_blank();
      replace(request.block, request.replace);
    reqblock = request.block;
    reqreplace = request.replace;
        //test();
    }
  });