
var images = $('img');

for (var i=0; i < images.length; i++) {
	loadThumbnail(images[i].id);
}

function loadThumbnail(imgId) {
	// display thumbnail in container
	$.get('/thumbnail/' + imgId, function(data) {
		$('#'+imgId).attr('src', data);
	});
};

function loadFullPicture(imgId) {
	// display full picture in page modal
	$.get('/image/' + imgId, function(data) {
		$('#modalImg').attr('src', data);
	});
};

// $('#imageBox').click( function(event) {
// 	var target = $(event.target);
// 	if (target.is('img')) {
// 		$('#GSCCModal').modal();
// 		loadFullPicture(event.target.id);
// 	}
// 	console.log(event.target.id);
// });
