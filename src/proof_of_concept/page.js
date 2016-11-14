<<<<<<< HEAD
////_5pbx userContent = all post usercontents
//function replace_entire_page(block_text, replace_text){
//    var elements = document.getElementsByTagName('*');
//    var block_words = block_text.split(",");
//    var replace_words = replace_text.split(",");
//    
//    //Parse Reg Exp for all replacements
//    var block_regstr = "";
//                for (var k=0; k < block_words.length-1; k++){
//                    block_regstr += "\\b"+block_words[k].trim() + "\\b" + "|";
//                }
//                block_regstr+= "\\b"+block_words[block_words.length-1].trim()+"\\b";
//    console.log(block_regstr);
//    //end parse
//    
//    for (var i = 0; i < elements.length; i++) {
//        var element = elements[i];
//
//        for (var j = 0; j < element.childNodes.length; j++) {
//            var node = element.childNodes[j];
//
//            if (node.nodeType === 3) {
//                var text = node.nodeValue;
//                
//                var wordchoice = Math.floor(Math.random()*replace_words.length);
//                
//                var re = new RegExp(block_regstr,"gi");
//                var replacedText = text.replace(re, replace_words[wordchoice]);
//
//                if (replacedText !== text) {
//                    element.replaceChild(document.createTextNode(replacedText), node);
//                }
//            }
//        }
//    }
//    console.log("Successfully Replaced");
//}
//
//function replace_facebook_post_blank(block_text){
//    var elements = document.getElementsByTagName('');
//}
//
//console.log("Tested");
//
//chrome.runtime.onMessage.addListener(
//  function(request, sender, sendResponse) {
//    console.log(sender.tab ? 
//                "from a content script:" + sender.tab.url :
//                "from the extension");
//    if (request.message_id == "submit"){
//      sendResponse({farewell: "goodbye"});
//        console.log("Block Values: " + request.block + "    Replace Values: " + request.replace);
//      //replace_entire_page(request.block, request.replace); //entire page
//    }

function replace(block_text, replace_text){
    var elements = document.getElementsByTagName('*');
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
    
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        for (var j = 0; j < element.childNodes.length; j++) {
            var node = element.childNodes[j];

            if (node.nodeType === 3) {
                var text = node.nodeValue;
                
                var wordchoice = Math.floor(Math.random()*replace_words.length);
                
                var re = new RegExp(block_regstr,"gi");
                var replacedText = text.replace(re, replace_words[wordchoice]);

                if (replacedText !== text) {
                    element.replaceChild(document.createTextNode(replacedText), node);
                }
            }
        }
    }
    console.log("Successfully Replaced");
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
      replace(request.block, request.replace);
    }
  });