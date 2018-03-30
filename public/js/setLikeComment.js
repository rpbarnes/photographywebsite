
// send post request to server to update the likes list in Photo model and increment the number of likes for the photo.
var like = $('.like');
like.click( function(event) {
	$.ajax({
        type: "POST",
        url: '/' + event.currentTarget.id,
        success: function(data) {
			if (data.loggedIn) {
				console.log(data.numLikes);
				$('#like'+data.id).html(data.numLikes);
			} else {
				console.log('You must log in!');
				location.href = 'http://www.ryanbarnesphoto.com/login';
			}
        },
        error: function(jqXHR, textstatus, errorThrown) {
            alert('text status ' + textstatus + ', err ' + errorThrown);
        }
    });
});
