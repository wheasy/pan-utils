/**
 * string相关操作
 * @class string
 */
var str_cfg = {
    'cellphone':'^[1][3-8]\\d{9}$',
    'email':'^[a-zA-Z]([a-zA-Z0-9]*[-_.]?[a-zA-Z0-9]+)+@([\\w-]+\\.)+[a-zA-Z]{2,}$'
}
var string = {
	/**
	 * 字符串截断方法
	 * @method stringLimit
	 * @param  {string}    string 要截断的字符串
	 * @param  {int}    num    截断的长度
	 * @param  {string}    sign   截断后要添加的字符串
	 * @return {string}           返回截断后的字符串
	 */
	stringLimit : function(string,num,sign){
		var sign = sign || '...';
		var reString = string.slice(0,num)+sign;
		return reString;
	},
	/**
	 * xss相关字符串操作
	 * @class string.xss
	 * @constructor
	 * @param  {string} string 需要过滤的字符串
	 * @return {object}        xss对象
	 */
	xss : function(string){
		var xssObj = function(){
			this.string = string;
			//替换默认黑名单
			this.relist = {
				'&':'&amp;',
				'<':'&lt;',
				'>':'&gt;',
				'\"':'&quot;',
				'\'':'&apos;'
			}
		}
		/**
		 * 得到删除对应黑名单符号
		 * @method getFiler
		 * @return {string}  删除后的字符串
		 */
		xssObj.prototype.getFiler = function(){
			var reword = '';
			for(var i in this.relist){
				if(reword == ''){
					reword = i;
				}else{
					reword = reword+'|'+i;
				}
				
			}
			var reg = new RegExp(reword,'ig');
			var reString = this.string.replace(reg,'');
			return reString;
		}
		/**
		 * 得到替换后的对应黑名单符号
		 * @method getReplace
		 * @return {string}   返回替换后的字符串
		 */
		xssObj.prototype.getReplace = function(){
			
			var reString = this.string;
			for(var i in this.relist){
				var reg = eval('/'+i+'/gi');
				reString = reString.replace(reg,this.relist[i]);
				console.log(reg);
			}

			return reString;
		}

		return new xssObj;
	},
	/**
	 * 正则验证相关方法
	 * @class string.validate
	 * @static
	 */
	validate : {
		/**
		 * 验证字符串是否符合规则
		 * @method verify
		 * @param  {string} string   字符串
		 * @param  {string} ruleName 规则名称在配置文件中validate_config
		 * @return {boolean}          true符合，false不符合
		 */
		verify : function(string,ruleName){
			var config = require('./pconfig');
			var regword = str_cfg[ruleName];
			if(typeof regword == 'undefined'){
				console.log('不存在正则');
			}
			console.log(regword);
			var reg = new RegExp(regword);
			return reg.test(string);
		},	
		/**
		 * 获得规则名对应正则表达式
		 * @method getRegExp
		 * @param  {string}  ruleName 规则名称
		 * @return {string}           正则表达式，false为不存在
		 */
		getRegExp : function(ruleName){
			var config = require('./pconfig');
			var regword = str_cfg[ruleName];
			if(typeof regword == 'undefined'){
				return false;
			}
			return regword;
		}
	}


}
module.exports = string;