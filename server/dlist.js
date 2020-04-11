const drivelist = require('drivelist');

exports.listDrives = function() {
    var __driveArr = [];
    return new Promise((resolve, reject) => {
        drivelist.list((error, drives) => {
            if (error) {
                //throw error;
                reject(error);
            }
            drives.forEach((drive) => {
                drive.mountpoints.forEach((dl) => {
                    __driveArr.push(dl.path.replace("\\", ""));
                });
            });
            resolve(__driveArr);
        });
    });
}