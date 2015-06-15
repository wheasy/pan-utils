var fs = require('fs'),
    path = require('path'),
    sep = path.sep,
    mutil = require('./putil');
var mfile = {
    /**
     * 通过获得所有目录下的文件
     * @method getAllFilesSync
     * @param  {string} filePath    文件路径
     * @param  {string} ext         要获取文件的后缀名名称
     * @param  {Array} filter       要过滤的文件名称列表
     *
     */
    getAllFilesSync: function(filePath, ext, filter) {
        filter = (filter ? filter : []).concat(['.svn', '.DS_Store']);
        var res = [],
            ext = ext && !mutil.isArray(ext) ?[ext]:ext,
            files = fs.readdirSync(filePath);

        files.forEach(function(file) {
            var pathname = path.join(filePath, file);
            stat = fs.lstatSync(pathname);
            if (!stat.isDirectory()) {
                var fileExt = path.extname(file),
                    fileExt = fileExt ? fileExt.slice(1) : 'unknown';
                if ((!ext || ext && mutil.in_array(fileExt, ext)) && !mutil.in_array(file, filter)) {
                    res.push(pathname);
                }
            } else if (!mutil.in_array(file, ['.svn'])) {
                pathname += sep;
                res = res.concat(mfile.getAllFilesSync(pathname, ext, filter));
            }
        });
        return res
    },
    /**
     * 通过获得所有目录下的目录
     * @method getAllFilesSync
     * @param  {string} filePath    文件路径
     * @param  {string} ext         要获取文件的后缀名名称
     * @param  {Array} filter       要过滤的目录称列表
     *
     */
    getAllDirsSync: function(filePath, filter) {
        var res = [],
            files = fs.readdirSync(filePath);
        filter = (filter ? filter : []).concat(['.svn', '.DS_Store']);
        files.forEach(function(file) {
            var pathname = path.join(filePath, file);
            stat = fs.lstatSync(pathname);
            if (stat.isDirectory() && !mutil.in_array(file, filter)) {
                res.push(pathname);
            }
        });
        return res
    },
    /**
     * 返回文件的真实路径
     * @method getAbsolutePath
     * @param  {string} filePath    文件相对路径
     */
    getAbsolutePath: function() {
        var p = require('path').join.apply(this, arguments);
        return require('path').join(require('./siteroot'), p);
    },
    /**
     * 获取文件扩展名（比含".")
     * @method getExtName
     * @param  {string}   filename 文件名称
     * @return {string}            扩展名
     */
    getExtName: function(filename) {
        if (!mutil.isString(filename) || !filename) {
            return '';
        }
        var r = filename.match(/\.([^.]+)$/);
        return r ? r[1] : '';
    },
    /**
     * 异步创建文件
     * @method createFile
     * @param  {String}   fileName 文件全部路径
     * @return {boolean}           是否创建成功
     */
    createFile: function(fileName, callback) {

        var fs = require('fs');
        var path = require('path');
        callback = callback ||
            function() {};
        mfile.mkdirs(path.dirname(fileName), 0777, function(err) {
            if (err) {
                fs.exists(fileName, function(exists) {
                    if (!exists) {
                        fs.open(fileName, "w+", 0777, function(e, fd) {
                            if (!e) {
                                fs.writeFile(fileName, "", function(e) {
                                    if (!e) {
                                        fs.close(fd, function() {
                                            callback(true);
                                        });
                                    } else {
                                        callback(false);
                                    }
                                })
                            } else {
                                callback(false);
                            }
                        });
                    } else {
                        //已存在返回真
                        callback(true);
                    }
                });
            }

        });
    },
    /**
     * 同步创建文件
     * @method createFileSync
     * @param  {string}       fileName 文件夹完整路径
     * @return {boolean}               是否创建成功
     */
    createFileSync: function(fileName) {
        var fs = require('fs');
        var path = require('path');
        mfile.mkdirsSync(path.dirname(fileName), 0777);
        if (!fs.existsSync(fileName)) {
            var fd = fs.openSync(fileName, "w+", 0777);
            if (fd) {
                fs.writeFileSync(fileName, "");
                fs.closeSync(fd);
                return true;
            }
            return false;
        }

    },
    /**
     * 同步创建文件夹
     * @method mkdirsSync
     * @param  {string}   dirpath 文件夹目录
     * @param  {string}   mode    文件夹权限
     * @return {boolean}          是否成功创建
     */
    mkdirsSync: function(dirpath, mode) {
        var path = require('path');
        var fs = require('fs');

        if (!fs.existsSync(dirpath)) {
            var pathtmp = '';
            dirpath.split(path.sep).forEach(function(dirname) {

                if (dirname != '') {
                    pathtmp = path.join(pathtmp, dirname);
                } else {
                    pathtmp = path.join(path.sep, dirname);
                }

                if (!fs.existsSync(pathtmp)) {
                    if (!fs.mkdirSync(pathtmp, mode)) {
                        return false;
                    }
                }

            });
        }
        return true;
    },
    /**
     * 异步创建多层文件夹
     * @method mkdirs
     * @param  {string}   dirpath  文件夹详细目录
     * @param  {sting}    mode      文件夹权限
     * @param  {Function} callback 回调函数
     * @return {boolean}            是否成功创建
     */
    mkdirs: function(dirpath, mode, callback) {
        var path = require('path');
        var fs = require('fs');

        callback = callback ||
            function() {};

        fs.exists(dirpath,
            function(exitsmain) {

                if (!exitsmain) {
                    //目录不存在
                    var pathtmp;
                    var pathlist = dirpath.split(path.sep);
                    var pathlistlength = pathlist.length;
                    var pathlistlengthseed = 0;

                    mfile.mkdir_auto_next(mode, pathlist, pathlist.length,
                        function(callresult) {
                            if (callresult) {
                                callback(true);
                            } else {
                                callback(false);
                            }
                        });

                } else {
                    callback(true);
                }

            });
    },
    // 异步文件夹创建 递归方法
    mkdir_auto_next: function(mode, pathlist, pathlistlength, callback, pathlistlengthseed, pathtmp) {
        var path = require('path');
        var fs = require('fs');
        callback = callback ||
            function() {};

        if (pathlistlength > 0) {

            if (!pathlistlengthseed) {
                pathlistlengthseed = 0;
            }

            if (pathlistlengthseed >= pathlistlength) {
                callback(true);
            } else {

                if (pathtmp) {
                    pathtmp = path.join(pathtmp, pathlist[pathlistlengthseed]);
                } else {
                    pathtmp = pathlist[pathlistlengthseed];
                    //修复从根目录开始错误
                    if (pathtmp == '') {
                        pathtmp = path.sep;
                    }
                }

                fs.exists(pathtmp,
                    function(exists) {
                        if (!exists) {
                            fs.mkdir(pathtmp, mode,
                                function(isok) {
                                    if (!isok) {
                                        mfile.mkdir_auto_next(mode, pathlist, pathlistlength,
                                            function(callresult) {
                                                callback(callresult);
                                            },
                                            pathlistlengthseed + 1, pathtmp);
                                    } else {
                                        callback(false);
                                    }
                                });
                        } else {

                            mfile.mkdir_auto_next(mode, pathlist, pathlistlength,
                                function(callresult) {
                                    callback(callresult);
                                },
                                pathlistlengthseed + 1, pathtmp);
                        }
                    });

            }

        } else {
            callback(true);
        }
    }
}
module.exports = mfile;