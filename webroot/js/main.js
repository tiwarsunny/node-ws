var CMD_INIT = "INIT";
var io = io();
var __curDirectory = "";
var isFetching = false;
var $dirList = $('#dirList')
var $windowBack = $('#windowBack')
var $windowNxt = $('#windowNxt')
var __dirIndex = -1;
var __pathArr = [];

//var uploader = new SocketIOFileUpload(socket);
//uploader.listenOnInput(document.getElementById("fileUpload"));

io.emit("init", CMD_INIT);
io.on("dlist", function (data) {
    $('#drivelist').empty();
    console.log(JSON.parse(data));
    $.each(JSON.parse(data), function (x, v) {
        var __anc = $("<a>");
        __anc.attr("href", "#");
        __anc.css("cursor", "pointer");
        __anc.attr("data-drive", v.Caption);
        __anc.html('<i class="fa fa-hdd-o"></i>&nbsp;' + v.Caption);

        $(__anc).click(function () {
            __dirIndex = -1;
            __pathArr = [];
            if (isFetching) return;
            __curDirectory = v.Caption + "\\";
            __fetch(__curDirectory);
            isFetching = true;
        });

        var __li = $('<li data-icon="<span class=\'mif-folder fg-orange\'>" data-caption="Video" data-content="<div class=\'mt-1\' data-role=\'progress\' data-value=\'35\' data-small=\'true\'>">');
        __li.append(__anc);
        $('#drivelist').append(__li);
    });
});
io.on("empty", function (d) {
    console.log("Drive Empty");
});

io.on("dstr", function (d) {
    //console.log(__curDirectory);
    $dirList.empty();
    $.each(d, function (k, v) {
        //console.log(v);
        var __anc = $("<a>");
        __anc.attr("href", "#");
        __anc.css("cursor", "pointer");
        __anc.css("line-break", "anywhere");
        __anc.css("word-break", "break-all");
        __anc.css("margin-left", "15px");
        __anc.css("margin-right", "15px");
        __anc.attr("data-drive", v);
        if (v.type === "d") {
            $(__anc).html('<i class="fa fa-folder"></i>');
            $(__anc).dblclick(function () {
                if (isFetching) return;
                __curDirectory += v.filename + "\\";
                __fetch(__curDirectory, true);
                isFetching = true;
            });
        } else {
            $(__anc).html('<i class="fa fa-file"></i>');
            $(__anc).click(function () {
                getFile(v);
            });
        }

        var $span = $("<span>");
        $span.html(v.filename.length > 15 ? (v.filename.substring(0,15) + '...') : v.filename);
        __anc.append($span);
        $dirList.append(__anc);
    });
    isFetching = false;
});

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
    console.log(__dirIndex, __pathArr);
    $('#windowPath').html(__curDir);
    $dirList.html("<i class=\"fa fa-spinner fa-spin fa-2x\"></i>Fetching Directory Listings...");
    io.emit("fetch", __curDir);
}

function getFile(fileData) {
    console.log(fileData);
}

$(function () {
    $($windowBack).click(function () {
        if (isFetching) return;
        if (__dirIndex === 0) return false;
        __dirIndex--;
        __curDirectory = __pathArr[__dirIndex]
        __fetch(__curDirectory, false);
        isFetching = true;
    });
    $($windowNxt).click(function () {
        if (isFetching) return;
        if (__dirIndex === __pathArr.length - 1) return false;
        __dirIndex++;
        __curDirectory = __pathArr[__dirIndex]
        __fetch(__curDirectory, false);
        isFetching = true;
    });
});