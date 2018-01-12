

var image = $('img');
loadFullPicture(image[0].id);

function loadFullPicture(imgId) {
	// display full picture in page modal
	$.get('/image/' + imgId, function(data) {
		$('#'+imgId).attr('src', data);
	});
};