console.log("popup.js");
function submit(){
    var replace_text = document.getElementById("replace_words").value;
    var block_text = document.getElementById("block_words").value;
    var c_mute = document.getElementById("c_mute").checked;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message_id: "submit", replace: replace_text, block: block_text, mute: c_mute}, function(response) {
        console.log(response.farewell);
      });
    });
}

//function submit(){
//    console.log(document.getElementById("replace_words").value);
//}

document.getElementById("button_submit").onclick = submit;