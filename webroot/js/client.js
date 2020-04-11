var CMD_INIT = "INIT";
var __io = io();
var __fileio = io();
var __curDirectory = "";
var isFetching = false;
var __dirList = $('#dirlist');
var $windowBack = $('#windowBack');
var $windowNxt = $('#windowNxt');
var __dirIndex = -1;
var __pathArr = [];
var __dexplorer = $('#dexplorer');

var uploader; //= new SocketIOFileClient(__fileio);

__io.emit("init", CMD_INIT);
__io.on("dlist", function (data) {
    __createDirectoryView(data);
    /**File Upload Events and Functions */
    uploader = new SocketIOFileClient(__fileio);
    var __uploadprogress = document.getElementById('uploadprogress');

    uploader.on('start', function (fileInfo) {
        console.log('Start uploading', fileInfo);
        __uploadprogress.innerHTML += ('<p id="' + fileInfo.uploadId + '"></p>');
    });
    uploader.on('stream', function (fileInfo) {
        var __totalSent = fileInfo.sent;
        console.log(fileInfo.sent, fileInfo.size);
        var __curUploadprogress = document.getElementById(fileInfo.uploadId);
        var __curprogress = Math.floor((__totalSent / fileInfo.size) * 100);
        __curUploadprogress.innerHTML = ('Uploading File : ' + fileInfo.name + '(' + __curprogress + '%) <div data-role="progress" data-value="' + __curprogress + '"></div>');
    });
    uploader.on('complete', function (fileInfo) {
        var __curUploadprogress = document.getElementById(fileInfo.uploadId);
        var __curprogress = Math.floor((fileInfo.wrote / fileInfo.size) * 100);
        __curUploadprogress.innerHTML = ('Uploading File : ' + fileInfo.name + '(' + __curprogress + '%) <div data-role="progress" data-value="' + __curprogress + '"></div>');
        console.log('Upload Complete', fileInfo);
        $(__curUploadprogress).hide('fadeout', function () {
            $(__curUploadprogress).remove();
        })
    });
    uploader.on('error', function (err) {
        console.log('Error!', err);
    });
    uploader.on('abort', function (fileInfo) {
        console.log('Aborted: ', fileInfo);
    });

});

__io.on("empty", function (d) {
    console.log("Drive Empty");
});

__io.on("dstr", function (d) {
    __createFileView(d);
});
/*===================================================*/

__fileio.on('upready', function (data) {
    console.log('upready', data);
    var fileEl = document.getElementById('clientfiles');
    var uploadIds = uploader.upload(fileEl, {
        data: { /*filepath: __curDirectory*/ }
    });
});

$('#btnUpload').click(function () {
    if (__curDirectory !== '') {
        console.log('initupload');
        __fileio.emit("initupload", __curDirectory)
    }
});
/**File Upload Events and Functions */
/*========================================================================*/
/**Directory Explorer Functions */

function __fetch(__curDir, __resetForward) {
    if (__resetForward) {
        var i = __dirIndex + 1;
        __pathArr.splice(i, (__pathArr.length - i));
    }
    var __arrIndex = $.inArray(__curDir, __pathArr);

    if (__arrIndex == -1) {
        __dirIndex++;
        __pathArr.push(__curDir);
    } else {
        __dirIndex = __arrIndex;
    }

    if (__dirIndex === 0) {
        $($windowBack).removeClass('fg-blue');
        $($windowBack).addClass('fg-gray');
    } else {
        $($windowBack).removeClass('fg-gray');
        $($windowBack).addClass('fg-blue');
    }
    if (__dirIndex === __pathArr.length - 1) {
        $($windowNxt).removeClass('fg-blue');
        $($windowNxt).addClass('fg-gray');
    } else {
        $($windowNxt).removeClass('fg-gray');
        $($windowNxt).addClass('fg-blue');
    }
    //console.log(__dirIndex, __pathArr);
    $('#windowPath').empty();
    console.log(__pathArr);
    $.each(__pathArr[__dirIndex].split('\\'), function (x, v) {
        if (v && v !== '') {
            var __link = $('<a>', {
                href: '#'
            });
            __link.addClass('fg-black');
            __link.html(v);
            $(__link).click(function () {
                __dirIndex = x;
                __curDirectory = __pathArr[__dirIndex];
                __fetch(__pathArr[x], true);
                return false;
            });
            $('#windowPath').append(__link);
            $('#windowPath').append('&nbsp;<i class="fa fa-caret-right fg-gray"></i>&nbsp;');
        }
    });
    $(__dirList).html("<i class=\"fa fa-spinner fa-spin fa-2x\"></i>Fetching Directory Listings...");
    __io.emit("fetch", __curDir);
}

function __showInfo(data, sender) {
    var __html = "Name : " + data.filename;
    __html += '<br>Type : ' + (data.type === 'd' ?
        'File Folder' :
        'File');
    __html += '<br>Size : ' + (data.type === 'd' ?
        0 :
        bytesToSize(data.size));
    $('#fDetails').html(__html);
    $(sender).attr('title', __html.split('<br>').join('\n'));
}
var bigblob = new Blob();

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0)
        return '0';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0)
        return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function getFile(fileData) {
    if (isDownloading) {
        denyFileDownload();
        console.log('a download in progress');
        return false;
    }
    __io.emit("downfile", {
        'cd': __curDirectory,
        'fd': fileData
    });
}
var isDownloading = false;
var notify = Metro.notify;

ss(__io).on('file', function (stream, fStat) {
    console.log(fStat);
    isDownloading = true;
    showFileDownloadProgress();
    var blob = new Blob();
    stream.on('data', function (data) {
        console.log('data', fStat.data.size);
        blob = new Blob([
            blob, data
        ], {
            type: blob.type
        })
        var curpercent = Math.floor((blob.size / fStat.data.size) * 100);
        $('#cper').html(fStat.data.filename + ' ' + curpercent + '%');
        $('#cperprogress').html('<div data-role="progress" data-value="' + curpercent + '"></div>');
    });
    stream.on('end', function (data) {
        console.log('end')
        var url = URL.createObjectURL(blob);
        isDownloading = false;
        setTimeout(function () {
            $('.notify').click();
        }, 800);
        //window.location=url;
        $('#fdownload').attr('href', url);
        //$('#fdownload').html(fStat.data.filename);
        $('#fdownload').attr('download', fStat.data.filename);
        $('#fdownload')[0].click();
        //window.URL.revokeObjectURL(url);
    });
});

function denyFileDownload() {
    /*notify.setup({
        duration: 1000,
        animation: 'easeOutBounce',
        cls:'alert'
    });
    notify.create('A download is in progress.');*/
    Metro
        .dialog
        .create({
            title: "Download is progress...",
            content: "A download is in progress.",
            cls: 'alert'
        });
}

function showFileDownloadProgress() {
    var notify = Metro.notify;
    notify.create('<span id="cper"></span><br><span id="cperprogress"></span>', null, {
        keepOpen: true
    });
}

function __getDirectory(v) {
    if (isFetching)
        return;
    __curDirectory += v.filename + "\\";
    __fetch(__curDirectory, true);
    isFetching = true;
}

function __createDirectoryView(data) {
    console.log(JSON.parse(data));
    $.each(JSON.parse(data), function (x, v) {
        //console.log(v);
        var __percentFull = Math.floor((v.FreeSpace / v.Size) * 100);
        //var isMounted = v.mountstatus;
        var __pNode = __dexplorer
            .data("listview")
            .add(null, {
                caption: (v.VolumeName || v.Description.replace('Fixed','')) + ' (' + v.Caption + ')',
                icon: "<span class='mif-drive fg-orange'>",
                content: "<div class='mt-1' data-role='progress' data-value='" + __percentFull + "' data-small='false'>"
            });
        $(__pNode).click(function () {
            __dirIndex = -1;
            __pathArr = [];
            if (isFetching)
                return;
            __curDirectory = v.Caption + "\\";
            __fetch(__curDirectory);
            isFetching = true;
        });
    });
}

function __createFileView(d) {
    $(__dirList).empty();
    //console.log(d);

    $.each(d, function (k, v) {
        var __anc = $("<li>");
        var __node = {};
        __node.caption = (v.filename.length > 15 ?
            (v.filename.substring(0, 12) + '...') :
            v.filename);
        __node.dtype = v.type;
        __node.icon = '<i class="fa fa-' + (v.type === "d" ?
            "folder" :
            "file") + '"></i>';

        var __nodeadd = $(__dirList)
            .data('listview')
            .add(null, __node);

        $(__nodeadd[0]).attr('data-cdate', v.cdate);
        $(__nodeadd[0]).attr('data-size', v.size);

        if (v.type === "d") {
            __nodeadd[0].ondblclick = function () {
                __getDirectory(v);
            };
        } else {
            __nodeadd[0].ondblclick = function () {
                getFile(v);
            }
        }
        __nodeadd[0].onmouseover = function () {
            __showInfo(v, this);
        }
    });
    isFetching = false;
}

var menuDisplayed = false;
var menuBox = null;


$(function () {
    $(__dirList).on("contextmenu", function () {
        var left = arguments[0].clientX;
        var top = arguments[0].clientY;

        menuBox = window.document.querySelector(".menu");
        menuBox.style.left = left + "px";
        menuBox.style.top = top + "px";
        menuBox.style.display = "block";

        arguments[0].preventDefault();

        menuDisplayed = true;
    });

    window.addEventListener("click", function () {
        if (menuDisplayed == true) {
            menuBox.style.display = "none";
        }
    }, true);


    $($windowBack)
        .click(function () {
            if (isFetching)
                return;
            if (__dirIndex === 0) {
                return false;
            }
            __dirIndex--;
            __curDirectory = __pathArr[__dirIndex];
            __fetch(__curDirectory, false);
            $($windowNxt).addClass('fg-blue');
            $($windowNxt).removeClass('fg-gray');
            isFetching = true;
            return false;
        });
    $($windowNxt).click(function () {
        if (isFetching)
            return;
        if (__dirIndex === __pathArr.length - 1) {
            return false;
        }
        __dirIndex++;
        $($windowBack).addClass('fg-blue');
        $($windowBack).removeClass('fg-gray');
        __curDirectory = __pathArr[__dirIndex];
        __fetch(__curDirectory, false);
        isFetching = true;
        return false;
    });
});
/**Directory Explorer Functions */