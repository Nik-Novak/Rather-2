console.log("popup.js");

var replace_global;

function submit(){
    
    rather.user.getData().then(function(data) {
        //replace list
        var temp = rather.replacementList.getElementsByClassName("txt");
    var replace_text = [];
    for(var i=0; i<temp.length; i++)
        replace_text[i] = temp[i].textContent;
    console.log("REPLACE: " + replace_text);
        
			// kill lists
        words = [];
		  wordset = data.wordsets;
        var keys = Object.keys(wordset);
        for(var item in wordset){
			var w = wordset[item];
            for(var item2 in w)
                if(item2 == "words")
                    words += w[item2] + ", ";
        }
        var block_text = words.substr(0,words.lastIndexOf(','));
        
        var c_mute = rather.filterSwitch.classList.contains("on");
        
        replace_global = replace_text;
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message_id: "submit", replace: replace_text, block: block_text, mute: c_mute}, function(response) {
        
            });
        });
        
    });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.message_id == "gif_request"){
        
        console.log("GIF REQUEST RECEIVED");
        
        words = replace_global + ""; //TODO
        words = words.split(",");
        for( var i=0; i<words.length; i++)
            words[i] = words[i].trim();
        
        
        var wordchoice = Math.floor(Math.random()*words.length);
        q = words[wordchoice]; // search query
        console.log("WORD: ");
        console.log(q);
	
	request = new XMLHttpRequest;
	request.open('GET', 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag='+q, true);
	request.onload = function() {
        
		if (request.status >= 200 && request.status < 400){
			data = JSON.parse(request.responseText).data.image_url;
			console.log(data);
			sendResponse({gif_url: data});
		} else {
			console.log('reached giphy, but API returned an error');
            sendResponse({gif_url: 'reached giphy, but API returned an error'});
		 }
	};
	request.onerror = function() {
		console.log('connection error');
        sendResponse({gif_url: 'connection error'});
	};
	request.send();
        
        
      
    }
      return true;
  });


//function submit(){
//    console.log(document.getElementById("replace_words").value);
//}

document.getElementById("button_submit").onclick = submit;