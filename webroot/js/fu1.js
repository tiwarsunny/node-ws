var socket = io();
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('form');

var __uploadprogress=document.getElementById('uploadprogress');

uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
    __uploadprogress.innerHTML+=('<p id="'+fileInfo.uploadId+'"></p><br>');
});
uploader.on('stream', function(fileInfo) {
    var __totalSent=fileInfo.sent;
    //console.log(fileInfo.sent,fileInfo.size);
    var __curUploadprogress=document.getElementById(fileInfo.uploadId);
    __curUploadprogress.innerHTML=('Uploading File : '+fileInfo.name+' ' + Math.floor(((__totalSent/fileInfo.size)*100)) + '%.');
});
uploader.on('complete', function(fileInfo) {
    var __curUploadprogress=document.getElementById(fileInfo.uploadId);
    __curUploadprogress.innerHTML=('Uploading File : '+fileInfo.name+' ' + Math.floor(((fileInfo.wrote/fileInfo.size)*100)) + '%.');
    console.log('Upload Complete', fileInfo);
});
uploader.on('error', function(err) {
    console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
    console.log('Aborted: ', fileInfo);
});
 
form.onsubmit = function(ev) {
    ev.preventDefault();
    
    var fileEl = document.getElementById('file');
    var uploadIds = uploader.upload(fileEl, {
        data: { /* Arbitrary data... */ }
    });
 
    // setTimeout(function() {
        // uploader.abort(uploadIds[0]);
        // console.log(uploader.getUploadInfo());
    // }, 1000);
};