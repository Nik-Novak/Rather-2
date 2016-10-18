function trigger(word){
<script type="text/javascript"/>
	var reader = new FileReader();
	var textFile = input.files[0]
	reader.readasText(textFile);
	$(reader).on('load', processFile);
function processFile(f){
	var file = f.target.result,
		results;
	if(file && file.length){
		line = file.split("\n");
		var catch = line.search(trigger);
}
if(catch.length > 0){
windows.alert("Word Found");

}
}
