var images = document.getElementsByTagName('img');

for (var i=0; i < images.length; i++) {
	loadThumbnail(images[i].id);
}

function loadThumbnail(imgId) {
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById(imgId).src = this.response;
		}
	};
	xhttp.open('GET', '/thumbnail/'+imgId, true);
	xhttp.send();
}