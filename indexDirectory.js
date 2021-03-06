/*eslint-env node, es6*/

var fs = require('fs'),
    path = require('path'),
    asyncLib = require('async'),
    File = require('./File.js');

/********************************
 * Filter Function used to keep files of certin types
 *******************************/
function checkcanEdit(filePath) {
    var ext = path.extname(filePath),
        keepers = ['.html', '.xml'];
    return keepers.includes(ext);
}

/***************************************
 * This function asynconusly gathers all the stuff that a file needs then calls the File Class
 ***************************************/
function makeFile(globalPath, makeFileCb) {

    //do we want to read the file?
    var canEdit = checkcanEdit(globalPath),
        file;

    //if not a text file don't read it in
    if (!canEdit) {
        file = new File(globalPath, '', canEdit);
        makeFileCb(null, file);
    } else {
        //read the file
        fs.readFile(globalPath, 'utf8', function (readFileErr, guts) {
            if (readFileErr) {
                makeFileCb(readFileErr);
                return;
            }
            file = new File(globalPath, guts, canEdit);
            makeFileCb(null, file);
        });
    }
}

/********************************
 * Sort out dirs and files based on a statobj
 *******************************/
function filterToFilesAndDirsPaths(items) {
    //these are the lists
    var sortedItems = {
        dirs: [],
        files: []
    };

    return items.reduce(function (acc, item) {
        if (item.isDir) {
            acc.dirs.push(item.path);
        } else if (item.isFile) {
            acc.files.push(item.path);
        }
        return acc;
    }, sortedItems);
}

/********************************
 * This gathers all the stuff it needs to make a Dir and then calls the Dir class
 *******************************/
function getDirFiles(fileListIn, globalPath, getDirFilesCb) {

    /********************************
     * This makes the filenames global and gets info from stats obj
     *******************************/
    function aboutFile(name, aboutFileCb) {
        var fullPath = path.join(globalPath, name);
        //get the stat obj for the item
        fs.stat(fullPath, function (errStat, statObj) {
            if (errStat) {
                aboutFileCb(errStat, null);
                return;
            }

            //send back the info we need
            aboutFileCb(null, {
                path: fullPath,
                isDir: statObj.isDirectory(),
                isFile: statObj.isFile()
            });
        });
    }

    fs.readdir(globalPath, function (readDirErr, dirList) {
        //check if err when reading the dir
        if (readDirErr) {
            return getDirFilesCb(readDirErr);
        }

        //figure out if the item is a file or folder
        asyncLib.map(dirList, aboutFile, function (aboutFileErr, items) {
            if (aboutFileErr) {
                getDirFilesCb(aboutFileErr);
                return;
            }

            // Give us only files, not directories, give filepaths
            var sortedItems = filterToFilesAndDirsPaths(items);
            // Make the file objects
            // Just to note if this dir doesn't have any files (sortedItems.files = []) then makeFile is not called and files = []
            asyncLib.map(sortedItems.files, makeFile, function (makeFileErr, files) {
                if (makeFileErr) {
                    getDirFilesCb(makeFileErr);
                    return;
                }

                /* Add our list of files to our current list */
                fileListIn = [...fileListIn, ...files];

                // Go through remaining directories for their files
                // Just to note if this dir doesn't have any dir (sortedItems.dir = []) then makeDir is not called and dirs = []
                asyncLib.reduce(sortedItems.dirs, fileListIn, getDirFiles, function (getDirFilesErr, fileListOut) {
                    if (getDirFilesErr) {
                        getDirFilesCb(getDirFilesErr);
                        return;
                    }
                    /* Send our list of files on once we've gone through every directory */
                    getDirFilesCb(null, fileListOut);
                });
            });
        });
    });
}

function indexer(globalPath, cb) {
    var fileList = [];
    getDirFiles(fileList, globalPath, cb);
}

/********************************
 * Start Here
 *******************************/
function runIndexDirectory(course, cb8) {
    //the path passed in will be a folder path so just use makeDir
    indexer(course.info.unzippedPath, (makeDirErr, fileList) => {
        if (makeDirErr) {
            course.fatalError(makeDirErr);
            cb8(makeDirErr, course);
            return;
        }

        course.content = fileList;
        course.message('Successfully indexed the course');
        cb8(null, course);
    });
}


module.exports = runIndexDirectory;