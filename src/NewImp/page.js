var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + 'AIzaSyCa_Co-vDUcs81I8bNw4OuBuBQZhuxlEOY';

function replace(block_text, replace_text){
    var elements = document.getElementsByClassName("_5pbx userContent");
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
    
    remove_text(elements, block_regstr);
    block_image();
    console.log("Successfully Replaced");
}

function remove_text(elements, block_regstr){
    for(var i=0; i<elements.length; i++){
        var ps = elements[i].getElementsByTagName('p');
        var combined = "";
        for(var j=0; j<ps.length; j++){
            combined += ps[j].innerText;
        }
        var regexp = new RegExp(block_regstr, "gi");
        var matches = combined.match(regexp);
        if(matches!=null){
            for(var k=0; k<ps.length; k++){
                ps[k].innerText = null;
            }
        var img = document.createElement("img");
        //img.src = "http://www.google.com/intl/en_com/images/logo_plain.png"; --replace image
        elements[i].appendChild(img);
        }
    }
}

//********************************IMAGES**************************************

function block_image(){
    var elements = document.getElementsByClassName("userContentWrapper");
    for(var i=0; i<elements.length; i++){
        var img = elements[i].getElementsByTagName("img");
        for( var j=0; j< img.length; j++){
            if(img[j]!=null){
                //console.log(img[j].src)
                //console.log("base sent " + img[j].src);
                getBase64FromImageUrl(img[j].src, function(b64code){
                    //console.log(b64code)
                    
                    sendFileToCloudVision(b64code,"LABEL_DETECTION");
                });
            }
        }
    }
    
}

function getBase64FromImageUrl(url, callback) {
    console.log(url);
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
        callback(final);
    };

    img.src = url;
}


function sendFileToCloudVision (content, type) {

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
    }]
  };
    
  xhr = new XMLHttpRequest();
    var url = CV_URL;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
        }
    }
    
var data = JSON.stringify(request);
xhr.send(data);
}

function displayJSON (data) {
  var contents = JSON.stringify(data, null, 4);
  console.log(contents);
  var evt = new Event('results-displayed');
  evt.results = contents;
  document.dispatchEvent(evt);
}

//****************************************************************************

function replace_facebook_blank(){
    var elements = document.getElementsByClassName("userContent");
    var strings; //= elements.getAttribute("innerText");
    for (var i=0; i<elements.length; i++ )
        if(elements[i].childNodes[0]!=null){
            elements[i].childNodes[0].nodeValue="Hello";
            console.log("Success!")
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
        //replace_facebook_blank();
      replace(request.block, request.replace);
    }
  });