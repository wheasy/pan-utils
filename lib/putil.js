/**
 * 封装常用的方法。如类型判断、类的集成
 * @namespace mo
 * @extends util
 * @class  util
 */
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return (/^\s+|\s+$/g).replace(this, '');
    }
}
var util = require('util'),
    HASOWN = Object.prototype.hasOwnProperty,
    TYPES = {
        'undefined': 'undefined',
        'number': 'number',
        'boolean': 'boolean',
        'string': 'string',
        '[object Function]': 'function',
        '[object RegExp]': 'regex',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object Error]': 'error'
    },
    guid = (new Date()).getTime(),
    ObjectCreate = Object.create,
    _apply = function(p, r, s, ov) {
        if (ov || !(p in r)) {
            r[p] = s[p];
        }
    },
    getType = function(o) {
        return TYPES[typeof o] || TYPES[Object.prototype.toString.call(o)] || (o ? 'object' : 'NULL');
    },
    mutil;


mutil = {
    create: function(proto, c) {
        var newPrototype;
        if (ObjectCreate) {
            newPrototype = ObjectCreate(proto);
        } else {
            emptyFn.prototype = proto;
            newPrototype = new emptyFn();
        }
        newPrototype.constructor = c;
        return newPrototype;
    },
    instanceOf: function(o, type) {
        return (o && o.hasOwnProperty && (o instanceof type));
    },
    /**
     * 过滤数组
     *
     * @method arr_filter
     * @return {Array} 返回过滤后的数组
     */
    arr_filter: function(arr, fun, ctx) {
        if (arr == null) {
            throw new TypeError();
        }

        if (typeof fun != "function") {
            throw new TypeError();
        }

        var res = [];
        mutil.each(arr, function(val, idx) {
            if (fun.call(ctx, val, idx)) {
                res.push(val);
            }
        });
        return res;
    },
    in_array: function(item, arr) {
        if (!arr) return;
        for (var i = 0, len = arr.length; i < len; ++i) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    },
    dedupe_array: function(a) {
        var hash = {},
            results = [],
            i,
            item,
            len,
            hasOwn = HASOWN;

        for (i = 0, len = a.length; i < len; ++i) {
            item = a[i];
            if (!hasOwn.call(hash, item)) {
                hash[item] = 1;
                results.push(item);
            }
        }
        return results;
    },
    /**
     * 混淆两个对象
     *
     * @method mix
     * @param {Object} targetObject 目标对象，新的属性将被覆盖到这个对象
     * @param {Object} sourceObject 来源对象，该对象的属性和方法将覆盖到目标对象
     * @param {Boolean} [isOverride=false] 是否覆盖目标对象已有的原属性和方法
     * @param {Array} [whiteList=[]] 白名单，该名单中的属性和方法不会合并到目标对象
     */
    mix: function(r, s, ov, wl) {
        if (!s || !r) return r;
        if (ov === undefined) ov = true;
        var i = 0,
            p, len;

        if (wl && (len = wl.length)) {
            for (; i < len; i++) {
                p = wl[i];
                if (p in s) {
                    _apply(p, r, s, ov);
                }
            }
        } else {
            for (p in s) {
                _apply(p, r, s, ov);
            }
        }
        return r;
    },
    /**
     * 将对象合并到一个新的对象上,并返回
     * @method merge
     * @param {object} name*  要合并的对象
     * @return {object} 返回merge后的新对象
     */
    merge: function() {
        var a = arguments,
            o = {},
            i, l = a.length;

        for (i = 0; i < l; i = i + 1) {
            a[i] = (typeof a[i] === 'object') ? a[i] : {};
            mutil.mix(o, a[i], true);
        }

        return o;
    },
    /**
     * 扩展一个对象
     * @method extend
     * @param {Object} targetObject 要扩展的对象
     * @param {Object} sourceObject 新的属性和方法
     * @param {Object} [px] 新增的prototype属性或方法
     * @param {Object} [sx] 新增的静态属性或方法
     * @return {Object} 目标对象
     */
    extend: function(r, s, px, sx) {
        if (!s || !r) return r;
        var sp = s.prototype,
            rp;


        // add prototype chain
        if (typeof s === 'boolean') {
            rp = mutil.create(sp, r);
            r.prototype = mutil.mix(rp, r.prototype);
            //chain r's constrator
            r.superclass = mutil.create(sp, s);
        }
        if (typeof s === 'object') {
            mutil.mix(r.prototype || r, s);
        }
        //新增原型属性
        if (px) {
            mutil.mix(rp, px);
        }
        //新加入属性
        if (sx) {
            mutil.mix(r, sx);
        }

        return r;
    }
};



mutil.extend(mutil, {
    /**
     * 判断参数是否是function
     * @method isFunction
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 参数是方法，则返回True
     */
    isFunction: function(o) {
        return getType(o) === 'function';
    },
    /**
     * 判断参数是否是未定义
     * @method isUndefined
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 如果参数未定义，则返回True
     */
    isUndefined: function(o) {
        return typeof o === 'undefined';
    },
    /**
     * 判断参数是否是数字
     * @method isNumber
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 参数是数字，则返回True
     */
    isNumber: function(o) {
        return typeof o === 'number' && isFinite(o);
    },
    /**
     * 判断参数是否是null对象
     * @method isNull
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 参数是null，则返回True
     */
    isNull: function(o) {
        return o === null;
    },
    /**
     * 判断参数是否是字符串
     * @method isString
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 参数是字符串，则返回True
     */
    isString: function(o) {
        return typeof o === 'string';
    },
    /**
     * 判断参数是否是对象
     * @method isObject
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 参数是对象，则返回True
     */
    isBoolean: function(o) {
        return typeof o === 'boolean';
    },
    isObject: function(o, failfn) {
        var t = typeof o;
        return o && (t === 'object' || mutil.isFunction(o));
    },
    /**
     * 判断参数是否是空对象
     * @method isEmptyObject
     * @param {Object} obj 要判断的对象
     * @return {Boolean} 参数是对象，则返回True
     */
    isEmptyObject: function(o) {
        for (var p in o) {
            return false;
        }
        return true;
    },
    /**
     *遍历一个对象或方法

     require('pan-utils').util.each(['a','b','c'], function(name, index){
        console.log(index + ':' + name);
     });
     结果:
         0:a
         1:b
         2:c

     * @method each
     * @param {Object|Array} obj 要遍历的数组或对象
     * @param {Function} each_callback 回调函数，第一个参数为值，第二个参数为索引
     */
    each: function(o, handle, ctx) {
        var length, i;
        if (!o || !mutil.isFunction(handle)) {
            return;
        }
        if (util.isArray(o) || (o.length && o[0])) {
            for (i = 0, length = o.length; i < length; i++) {
                if (handle.call(ctx || o[i], o[i], i) === false) {
                    break;
                }
            }

        } else {
            for (i in o) {
                if (handle.call(ctx || o[i], o[i], i) === false) {
                    break;
                }
            }
        }
    },
    setObjValue: function(o, path, val) {
        //{} a.b.c val
        var i,
            p = path.split('.'),
            leafIdx = p.length - 1,
            ref = o;

        if (p && leafIdx >= 0) {
            for (i = 0; ref != 'undefined' && i < leafIdx; i++) {
                ref[p[i]] = ref[p[i]] || {};
                ref = ref[p[i]];
            }
            if (ref) {
                ref[p[i]] = val;
            } else {
                return 'undefined';
            }
        }

        return o;
    },
    /**
     * 格式化时间
     
        require('pan-utils').util.format(new Date());//2014-04-01
        require('pan-utils').util.format(new Date(), 'yyyy-mm-dd HH:MM:SS');//2014-04-01 12:30:45
     
     * @method formatTime
     * @param  {Date} date 日期对象
     * @param  {String} [format='yyyy-mm-dd'] 格式
     * @return {String}   
     */
    formatTime: function(date, format) {
        format = format || 'yyyy-mm-dd';
        return format.replace(/y+/i, date.getFullYear())
            .replace(/m+/, ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1))
            .replace(/d+/, (date.getDate() < 10 ? "0" : "") + date.getDate())
            .replace(/H+/, (date.getHours() < 10 ? "0" : "") + date.getHours())
            .replace(/M+/, (date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
            .replace(/S+/, (date.getSeconds() < 10 ? "0" : "") + date.getSeconds());
    },
    /**
     * 读取对象深层的属性
     * @method  getObjValue
     * @param  {Object} targetObject    要读取的对象
     * @param  {String} path 属性路径
     * @return {Object} 如targetObject不是Object，返回undefined
     */
    getObjValue: function(o, path) {
        if (!L.isObject(o)) {
            return undefined;
        }

        var i,
            p = path.split('.'),
            l = p.length;

        for (i = 0; o !== 'undefined' && i < l; i++) {
            o = o[p[i]];
        }

        return o;
    },
    /**
     * 生成唯一标志
     * @method guid
     * @param {String} [pre=mutil_] 前缀
     * @return {String} 如 "mutil_10938737462"
     */
    guid: function(pre) {
        return (pre || 'mo_') + (++guid);
    },
    /**
     * 获得对象的唯一标志。
     
     //code1:
     var obj = {}
     console.log(require('pan-utils').util.stamp(obj,false,'mid'));//output:motil_123456789
     //obj is {mid:'motil_123456789'} now

     //code2:
     var obj = {id:'1234567'}
     console.log(require('pan-utils').util.stamp(obj));//output:1234567

     //code3:
     var obj = {}
     console.log(require('pan-utils').util.stamp(obj), true);//output:null

     * @method stamp
     * @param {Object} obj
     * @param {Boolean} [readOnly=false]如果该对象没有唯一标志，且readOnly不为True，则为它打上唯一标志，并返回标志的值
     * @param {String} [id=id] 作为标志的属性，默认为“id"
     * @return {String}唯一标识符
     */
    stamp: function(o, readOnly, id) {
        var id = id | 'id',
            uid;
        if (!o) return o;
        uid = o[id];
        if (!uid & !readOnly) {
            uid = mutil.guid();
            try {
                o[id || 'id'] = uid;
            } catch (e) {
                uid = null;
            }
        }
        return uid;
    },
    clone: function(o, safe, f, c, cloned) {
        var o2, marked, stamp;
        if (!mutil.isObject(o)) {
            return o;
        }

        marked = cloned || {};

        switch (getType(o)) {
            case 'date':
                return new Date(o);
            case 'regexp':
                // if we do this we need to set the flags too
                // return new RegExp(o.source);
                return o;
            case 'function':
                // o2 = Y.bind(o, owner);
                // break;
                return o;
            case 'array':
                o2 = [];
                break;
            default:
                o2 = {};
        }

        mutil.each(o, function(v, k) {
            if ((k || k === 0) && (!f || (f.call(c || this, v, k, this, o) !== false))) {
                if (k !== 'prototype') {
                    this[k] = mutil.clone(v, safe, f, c);
                }
            }
        }, o2);

        return o2;
    },
    replaceHtml: function(string) {
        var HTML_CHARS = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;'
        };
        return (string + '').replace(/[&<>"'\/']/g, function(match) {
            return HTML_CHARS[match]
        });
    }

});

mutil.extend(mutil, {
    /**
     * 获取本机IP地址
     * @return {[type]} [description]
     */
    getLocalIp: function() {
        var os = require('os');
        var nes = os.networkInterfaces();
        var ips = [];
        for (ne in nes) {
            ne = nes[ne]
            for (var i = 0; i < ne.length; i++) {
                if (/^(\d+\.){3}\d+$/.test(ne[i].address)) {
                    if (ne[i].address != '127.0.0.1') {
                        ips.push(ne[i].address)
                    }
                }
            }
        }
        return ips;
    }
});

module.exports = mutil.extend(mutil, require('util'));