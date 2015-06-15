/**
 * 提供配置相关操作
 * @class class
 */
var mclass = {

    /**
     * 创建类
     * 通过该方法创建的类具有set和get方法
     
        var cls = class.create({
                name : 'moui'
            }),
            obj = new cls();
        console.log(obj.get('name'));//output: moui

     * @method create
     * @param {Object} [proto]
     * @example
        {
            //构造函数
            init:function(){    
            },
            //属性
            attrs:{
                age:{
                    setter:function(val){
                        if(!require('pan-utils').util.isNumber){
                            throw new TypeError();
                        }
                    }
                },
                name:'none'
            }   
        }

     * @return {Object} 返回新的类
     */
    create: function(proto) {
        var ret = function() {
            var self = this;
            self._data = {};
            require('pan-utils').util.each(this._attrs, function(v, k) {
                self.set(k, v, true);
            });
            if (self._init) {
                self._init.apply(self, arguments);
            }
            if (self.init) {
                self.init.apply(self, arguments);
            }
            return self;
        };
        if (proto && proto.attrs) {
            proto._attrs = proto.attrs;
            delete proto.attrs;
        }

        require('pan-utils').util.extend(ret, mclass.base);
        proto && require('pan-utils').util.extend(ret, proto);
        return ret;
    },
    /**
     * @class base
     */
    base: {
        /**
         * 存储对象属性的位置，这些属性可通过this.get(name)和this.set(name)更新或修改
         * @property _data
         * @private
         */
        _init:function(attrs){
            require('pan-utils').util.each(attrs, function(v, k){
                this.set(k, v);
            }, this);
        },
        /**
         * 设置属性
         * @method set
         * @param {String}  name    属性名称
         * @param {any}  val     属性的值
         * @param {Boolean} [isClone=false] 是否克隆
         */
        set: function(name, val, isClone) {
            var self = this;
            if (require('pan-utils').util.isObject(name)) {
                require('pan-utils').util.each(name, function(v, k) {
                    self.set(k, v, val);
                });
            }
            var d = this._data;
            if (isClone === true) {
                val = require('pan-utils').util.clone(val);
            }
            if (!(d && d[name])) {
                d[name] = {};
            }

            if (d && name in d && d[name].readOnly == true) return this;

            if (d[name]['setter']) {
                val = d[name]['setter'].call(this, val);
            }

            d[name]['value'] = val;
            return this;
        },
        /**
         * 读取属性
         * @method get
         * @param {String}  name    属性名称
         * @return {any} [isClone=false] 是否克隆
         */
        get: function(name) {
            var d = this._data;
            return (d && name in d) ? (d[name]['getter'] ? d[name]['getter'].apply(this) : d[name]['value']) : undefined;
        }
    }
}
module.exports = mclass;