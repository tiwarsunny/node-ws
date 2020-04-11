var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ss = require('socket.io-stream');
const path = require('path');
const fs1 = require('fs');

const SocketIOFile = require('socket.io-file');

var uploader;
//var __ld = require('./server/dmount');
//var __ad = require('./server/dlist');
var __ddl = require('./server/ddl');
const __root = path.join(__dirname, 'webroot\\');
app.use(express.static(path.join(__dirname, 'webroot')));

app.get('/', function (req, res) {
    //res.sendFile('index.html');
    //res.redirect('/explorer');
    __serveFile(res, "windows-home.html");
});

app.get('/socket.io-file-client.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

app.get('/socket.io-stream.js', function (req, res) {
    res.sendFile(__dirname + '/node_modules/socket.io-stream/socket.io-stream.js');
});

/*app.get('/explorer', function (req, res) {
    __serverFile(res, "windows-home.html");
});
app.get('/ex1', function (req, res) {
    __serverFile(res, "new-window.html");
});*/

function __serveFile(res, fileName) {
    res.sendFile(fileName, {
        root: __root
    });
}

/**
 * Socket Server Communication Events
 */
var CMD_INIT1 = "INIT";
//__ad.allDrives().then((drives) => console.log(drives));
users = [];
io.on('connection', function (socket) {
    //__fileReceiver.dir = __dirname;
    //__fileReceiver.listen(socket);
    socket
        .on("init", function (data) {
            console.log("Init Occured with command : " + data);

            __ddl
                .listDrives()
                .then((data) => __processData(data, socket)).catch((error) => {
                    console.log(error);
                });
        });

    socket.on("fetch", function (data) {
        console.log("Fetching Directory Listing for " + data);
        var __fileLists = getFileInfoFromFolder(data, socket);
        socket.emit("dstr", __fileLists);
    });

    socket.on('downfile', function (data) {
        console.log('downfile', data);
        var filepath = data.cd + '\\' + data.fd.filename;
        var stream = ss.createStream();
        ss(socket).emit('file', stream, {data: data.fd  });
        fs1.stat(filepath, function (err, stats) {
            var fileSize = stats.size;
            var __rStream = fs1.createReadStream(filepath, {
                bufferSize: 64 * 1024,
                highWaterMark: 256 * 1024
            });
            __rStream.pipe(stream);
            console.log(__rStream.length);
            __rStream.on('data', function (data) {
                console.log(data.length +' Bytes sent');
            });
            __rStream.on('end', function () {
                socket.emit('fend', data);
            });
        });
    });
    socket.on('initupload', function (data) {
        console.log('initupload', data);
        /**File Upload Function and Events */
        var uploader = new SocketIOFile(socket, {
            // uploadDir: {			// multiple directories
            // 	music: 'data/music',
            // 	document: 'data/document'
            // },
            uploadDir: data, // simple directory
            //accepts: ['audio/mpeg', 'audio/mp3'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
            maxFileSize: 114194304, // 4 MB. default is undefined(no limit)
            chunkSize: 10240, // default is 10240(1KB)
            transmissionDelay: 0, // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
            overwrite: true // overwrite file if exists, default is true.
        });
        uploader.on('start', (fileInfo) => {
            console.log('Start uploading');
            //uploader.options.uploadDir=fileInfo.filepath;
        });
        uploader.on('stream', (fileInfo) => {
            //console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
        });
        uploader.on('complete', (fileInfo) => {
            console.log('Upload Complete.');
            console.log(fileInfo);
        });
        uploader.on('error', (err) => {
            console.log('Error!', err);
        });
        uploader.on('abort', (fileInfo) => {
            console.log('Aborted: ', fileInfo);
        });
        console.log('Upready Emitted');
        socket.emit('upready', "uploader");
        /**File Upload Function and Events */
    });

});
/**
 * Socket Server Communication Events
 */
/**
 * Server Explorer Functions
 * @param {*} data 
 * @param {*} s 
 */
function __processData(data, s) {
    console.log('emit', data);
    s.emit("dlist", JSON.stringify(data));
}

function getFileInfoFromFolder(route, socket) {
    try {
        var response = [];
        const files = fs1.readdirSync(route, 'utf8');
        for (let file of files) {
            const extension = path.extname(file);
            var __fileStats = {};
            try {
                var stats = fs1.lstatSync(route + file);
                if (stats) {
                    //console.log(file, stats.isFile(), stats.isDirectory());
                    var __type = "",
                        __size = 0,
                        __rightaccess = "";
                    if (stats.isFile()) {
                        __type = "f";
                        __size = stats["size"];
                        __rightaccess = "-";
                    } else {
                        __type = "d";
                        __rightaccess = "d";
                    }

                    var __createdDate = stats["birthtime"];
                    var __modifiedDate = stats["mtime"];
                    /**Owner Access */
                    __rightaccess += (stats["mode"] & 100 ?
                        'x' :
                        '-');
                    __rightaccess += (stats["mode"] & 200 ?
                        'w' :
                        '-');
                    __rightaccess += (stats["mode"] & 400 ?
                        'r' :
                        '-');
                    /**Group Access */
                    __rightaccess += (stats["mode"] & 10 ?
                        'x' :
                        '-');
                    __rightaccess += (stats["mode"] & 20 ?
                        'w' :
                        '-');
                    __rightaccess += (stats["mode"] & 40 ?
                        'r' :
                        '-');
                    /**Others Access */
                    __rightaccess += (stats["mode"] & 1 ?
                        'x' :
                        '-');
                    __rightaccess += (stats["mode"] & 2 ?
                        'w' :
                        '-');
                    __rightaccess += (stats["mode"] & 4 ?
                        'r' :
                        '-');

                    __fileStats.filename = file;
                    __fileStats.type = __type;
                    __fileStats.size = __size;
                    __fileStats.extension = extension;
                    __fileStats.access = __rightaccess;
                    __fileStats.cdate = __createdDate;
                    __fileStats.mdate = __modifiedDate;
                }
                response.push(__fileStats);
            } catch (error) {}
        }
        //console.log(response);
        return response;
    } catch (error) {
        console.log(error);
        socket.emit("empty");
        return false;
    }
}
/**Server Explorer Functions */
http
    .listen(3000, function () {
        console.log('listening on localhost:3000');
    });