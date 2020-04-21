var spawn = require("child_process").spawn
var readline = require('readline');
var stream = require('stream');

//function listDrive() {
exports.listDrives = function () {
    const list = spawn('cmd');
    var i = 0;
    var count = 0;
    var showConsole = false;
    var __drivelist = [];
    return new Promise((resolve, reject) => {
        //console.log(list.stdout);
        /*list.stdout.on('data', function (data) {
            //console.log(data);
            const output = String(data);
            //console.log(output);
            var bufferStream = new stream.PassThrough();
            bufferStream.end(data);

            var rl = readline.createInterface({
                input: bufferStream,
            });

            rl.on('line', function (line) {
                var __line = String(line);
                if (__line.substring(0, __line.length - 1) == process.cwd()) {
                    showConsole = false;
                    if(__drivelist.length > 0){
                        resolve(__drivelist);
                    }
                    else{
                        reject("Error While fetching Drives");
                    }
                }
                if (showConsole && __line != "") {
                    var out = __line.split("  ").map(e => e.trim()).filter(e => e != "")
                    __drivelist.push({
                        'letter': out[0],
                        'type': out[1],
                        'mountstatus': out[2] === undefined ? false : true,
                        'freespace': out[2] !== undefined ? out[2] : 'Not Mounted',
                        'totalspace': out[3] !== undefined ? out[3] : 'Not Mounted',
                    })
                }
                if (__line.substring(0, 7) == 'Caption') {
                    showConsole = true;
                }
            });
        });

        list.stderr.on('data', function (data) {
            // console.log('stderr: ' + data);
        });

        list.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            if (code !== 0) {
                reject(code)
            }
        });

        list.stdin.write('wmic logicaldisk get caption,description,freespace,size\n');
        list.stdin.end();*/
        var WmiClient = require('wmi-client');
        var wmi = new WmiClient();
        wmi.query('SELECT caption,description,freespace,size,volumename FROM win32_logicaldisk', function (err, result) {
            if (result) {
                //console.log(result);
                resolve(result)
            } else {
                reject(err)
            }
        });


    })
}
//listDrive().then((data) => console.log(data));