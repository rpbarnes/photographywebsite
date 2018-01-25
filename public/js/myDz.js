// Dropzone.options.myDropzone = {

//   // Prevents Dropzone from uploading dropped files immediately

//   autoProcessQueue: false,

//   init: function() {
//     var submitButton = document.querySelector("#submit")
//         myDropzone = this; // closure

//     submitButton.addEventListener("click", function() {
//       myDropzone.processQueue(); // Tell Dropzone to process all queued files.
//     });

//     // You might want to show the submit button only when 
//     // files are dropped here:
//     this.on("addedfile", function() {
//       // Show submit button here and/or inform user to click it.
//     });

//   }
// };
//


Dropzone.options.uploadWidget = { // The camelized version of the ID of the form element

  // The configuration we've talked about above
  autoProcessQueue: false,
  uploadMultiple: true,
  parallelUploads: 100,
  maxFiles: 100,
  paramName: 'file',
  acceptedFiles: 'image/*',
  addRemoveLinks: true,

  // The setting up of the dropzone
  init: function() {
    var myDropzone = this;

    // First change the button to actually tell Dropzone to process the queue.
    $('#submitButton').click( function(e) {
      // Make sure that the form isn't actually being sent.
      e.preventDefault();
      e.stopPropagation();
      myDropzone.processQueue();
    });

    // Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
    // of the sending event because uploadMultiple is set to true.
    this.on("sendingmultiple", function() {
      // Gets triggered when the form is actually being sent.
      // Hide the success button or the complete form.
      $('#submitButton').attr('disabled',true);
      $('#done').attr('disabled',true);
    });
    this.on("successmultiple", function(files, response) {
      // Gets triggered when the files have successfully been sent.
      // Redirect user or notify of success.
      $('#submitButton').attr('disabled',false);
      $('#done').attr('disabled',false);
    });
    this.on("errormultiple", function(files, response) {
      // Gets triggered when there was an error sending the files.
      // Maybe show form again, and notify user of error
    });
  }
 
}
