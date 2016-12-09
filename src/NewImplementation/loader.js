var xhr = new XMLHttpRequest(),
        s = document.createElement('script');

    // Send the request to retrieve custom.js
    xhr.open('GET', 'settings_packet.js', false);
    xhr.send();

//    // Listen for onload, and remove the script after execution
//    s.addEventListener("load", function(e) {
//        s.parentElement.removeChild(s);
//    });

    // Load the code inside the script and run it in the head
    s.textContent = xhr.responseText;
    document.head.appendChild(s);
    
    xhr.onreadystatechange = function () { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            page_test();
        }
    }