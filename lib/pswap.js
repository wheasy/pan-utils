global.mo_swap = {};
/**
 * 设置缓存，当参数是一个是
 * @param {String} key 缓存名称
 * @param {Any} [value] 要设置的缓存的值
 * @example
 * //把用户昵称缓存起来
 * require('pan-utils').swap('username', 'tick')
 * //从缓存读取用户昵称
 * require('pan-utils').swap('username')
 * @return {Any} 缓存的值
 */
module.exports = function(){
    if(arguments.length == 1){
        return global.mo_swap[arguments[0]];
    }
    if(arguments.length==2){
        global.mo_swap[arguments[0]] = arguments[1];
        return global.mo_swap[arguments[0]];
    }
    return global.mo_swap;
}