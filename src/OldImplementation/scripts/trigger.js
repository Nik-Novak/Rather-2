document
    .getElementById('files')
    .addEventListener(
        'change',
        function () {
            var fr = new FileReader();
            fr.onload = function () {
                document.getElementById('contents').textContent = this.result;
            };
            fr.readAsText(this.files[0]);
        }
    );

/*var triggerInput = $('#trigger')
var fileInput = $('#files');
var uploadButton = $('#upload');

uploadButton.on('click', function()) {
    if (!window.FileReader) {
        alert('Your browser is not supported');
        return false;
    }
    var input = fileInput.get(0);

    // Create a reader object
    var reader = new FileReader();
    if (input.files.length) {
        var textFile = input.files[0];
        // Read the file
        reader.readAsText(textFile);
        // When it's loaded, process it
        $(reader).on('load', processFile);
    } else {
        alert('Please upload a file before continuing')
    }
});

function processFile(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
        results = file.split("\n");
	for(i=0; i<results.length ; i++){
		if(results[i] == triggerInput){
			results[i] = "Trigger word found";
        		document.write(results[i] + "<br>")

		}
	}
*/
