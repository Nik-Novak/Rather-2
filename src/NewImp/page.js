var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + 'AIzaSyCa_Co-vDUcs81I8bNw4OuBuBQZhuxlEOY';
var prevRem = [];

var c_mute;

var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

function replace(block_text, replace_text){
    prevRem = [];
    var elements = document.getElementsByClassName("userContentWrapper");
    
    //elements[0].getElementsByTagName('p')[0].innerText = "LOL";
    console.log("content!");
    
    var block_words = block_text.split(",");
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
    //var textmarked = mark_remove_text(elements, block_regstr);
    //remove_text(textmarked, elements);
    
    block_image(block_regstr);
    
    //while(imagesFetching>0)
        //console.log("Looping, imagesFetching = " + imagesFetching );
    
    //remove images here
        
    console.log("Successfully Replaced");
}

function remove_text(textmarked, elements){
    for (var i=0; i<textmarked.length; i++){
        elements[textmarked[i]].innerHTML = null;
    }
}

function mark_remove_text(elements, block_regstr){
    var markremove = [];
    for(var i=0; i<elements.length; i++){
        var ps = elements[i].getElementsByTagName('p');
        var combined = "";
        for(var j=0; j<ps.length; j++){
            combined += ps[j].innerText;
        }
        var regexp = new RegExp(block_regstr, "gi");
        var matches = combined.match(regexp);
        if(matches!=null){
            markremove.push(i);
//            for(var k=0; k<ps.length; k++){
//                //ps[k].innerText = null;
//            }
        //var img = document.createElement("img");
        //img.src = "http://www.google.com/intl/en_com/images/logo_plain.png"; --replace image
        //elements[i].appendChild(img);
        }
    }
    return markremove;
}

//********************************IMAGES**************************************

function block_image(block_regstr){
    var elements = document.getElementsByClassName("userContentWrapper");
    for(var i=0; i<elements.length; i++){
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
            elements[index].innerHTML=null;
            var img = document.createElement("img");
        img.src = "http://imgur.com/download/cl24nXb"; //--replace image
        elements[index].appendChild(img);
            injectErr(elements[index]);
        }
        
    }
}

function injectErr(element){
    var p = document.createTextNode(" {\"meta\": {\"error_type\": \"OAuthAccessTokenException\", \"code\": 400, \"error_message\": \"The access_token provided is invalid.\"}} ");
    element.appendChild(p);
}

function getImages(){
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
    jsontext = request.responseText;

    alert(jsontext);
    }

    request.open("GET", "https://extraction.import.io/query/extractor/THE_PUBLIC_LINK_THEY_GIVE_YOU?_apikey=YOUR_KEY&url=YOUR_URL", true);

    request.send();
}

//****************************************************************************

function replace_facebook_blank(){
    var elements = document.getElementsByClassName("userContent");
    var strings; //= elements.getAttribute("innerText");
    for (var i=0; i<elements.length; i++ )
        if(elements[i].childNodes[0]!=null){
            elements[i].childNodes[0].nodeValue="Hello";
            console.log("Success!");
        }
    //console.log(strings);
}

console.log("Tested");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?  //console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.message_id == "submit"){
      sendResponse({farewell: "goodbye"});
        console.log("Block Values: " + request.block + "    Replace Values: " + request.replace);
        c_mute = Boolean(request.mute);
        
        //replace_facebook_blank();
      replace(request.block, request.replace);
        //test();
    }
  });

function test(){
    var request = new XMLHttpRequest();

request.onreadystatechange = function() {
  jsontext = request.responseText;

  alert(jsontext);
}

request.open("GET", "https://extraction.import.io/query/extractor/THE_PUBLIC_LINK_THEY_GIVE_YOU?_apikey=YOUR_KEY&url=YOUR_URL", true);

request.send();
}