/**
 * ValVerify, Element-ui表单值校验插件：valVerify
 * options: 
 *  - tipHeight: Number, tip提示的高度
 * return: {success: success, msg: msg}
 * ! 需用于绑定model的vue组件
 * xiezhichao
 * 2018/05/10
 */

/**
 * plugin intaller
 */
export const ValVerify = function(Vue, options) {
    tipHeight = options.tipHeight || '40'
    Vue.prototype.formCheck = formCheck 
    Vue.directive('valv', {
        bind: function (el, binding, vnode) {
            let value = binding.value
            if(value === undefined || value == null) {
                console.error('校验指令参数错误')
                return
            }
            if(ValForms[value.form] === undefined || ValForms[value.form] === null) {
                ValForms[value.form] = {}
            }
            if(ValForms[value.form][value.name] === undefined || ValForms[value.form][value.name] === null) {
                ValForms[value.form][value.name] = {}
            }
            let val = vnode.data.model.value
            ValForms[value.form][value.name]['val'] = val
            ValForms[value.form][value.name]['el'] = el
            ValForms[value.form][value.name]['rule'] = value.rule || 'require'
            ValForms[value.form][value.name]['title'] = value.title
            ValForms[value.form][value.name]['tip'] = addTip(el)
        },
        update: function (el, binding, vnode) {
            let value = binding.value
            let oldValue = binding.oldValue
            if(value === undefined || value == null) {
                console.error('校验指令参数错误')
                return
            }
            let val = vnode.data.model.value
            let oldVal = ValForms[value.form] && ValForms[value.form][value.name] && ValForms[value.form][value.name]['val']
            if(val !== oldVal) {
                ValForms[value.form][value.name]['val'] = val
                if(value.auto !== false) {
                    verify(ValForms[value.form][value.name])
                }
            }
        },
        unbind: function (el, binding, vnode) {
            let value = binding.value
            if(value === undefined || value == null) {
                console.error('校验指令参数错误')
                return
            }
            if(ValForms[value.form] && ValForms[value.form][value.name]){
                if(ValForms[value.form][value.name]['tip']){
                    el.removeChild(ValForms[value.form][value.name]['tip'])
                }
                delete ValForms[value.form][value.name]
            }
        }
      })   
} 
/**
 * 存放需交验的组件，按formName存放
 */
let ValForms = {}
/**
 * tip提示的高度, number
 */
let tipHeight 
/**
 * 表单校验
 * @param {String} form 
 */
const formCheck = function(form) {
    let pass = true
    let checkList = ValForms[form]
    if(checkList === undefined || checkList === null) {
        console.error('form不存在')
        return false
    }
    
    for(let i in checkList) {
        if(!verify(checkList[i], false).success) {
            pass = false
        }
        
    }

    return pass
}

const verify = function(target) {
    let el = target.el
    let value = target.val
    let rule = target.rule
    let tip = target.tip
    let ret = verifier(el, value, rule)
    
    if(!ret.success) {
        tip.setAttribute('title', (target.title !== undefined && target.title !== null? target.title + ': ' : '') + ret.msg)
        tip.style.display = 'inline'
    } else {
        tip.setAttribute('title', '')
        tip.style.display = 'none'
    }

    return ret
}

const verifier = (el, value, rule) => {
    if(typeof(rule) === 'string') {
        let rule_ = _rules[rule]
        if(typeof(rule_) === 'object') {
            if(rule_.ruleExp.test(value)) {
                removeClass(el)
                return verMsg(true, '校验通过!')
            } else {
                addClass(el)
                return verMsg(false, rule_.error)
            }
        } else {
            console.log('校验规则错误!')
            return verMsg(false, '校验规则错误!')
        }
    } else if(typeof(rule) === 'function') {
        if(rule.call(this, value)) {
            removeClass(el)
            return verMsg(true, '校验通过!')
        } else {
            addClass(el)
            return verMsg(false, rule_.error)
        }
    } else if(typeof(rule) === 'object' && rule instanceof RegExp) {
        if(rule_.test(value)) {
            removeClass(el)
            return verMsg(true, '校验通过!')
        } else {
            addClass(el)
            return verMsg(false, rule_.error)
        }
    } else {
        console.log('校验规则错误!')
        return verMsg(false, '校验规则错误!')
    }
}

const hasClass = (dom, _class) =>  !!dom.className.match(new RegExp('(\\s|^)' + _class + '(\\s|$)'))

const addClass = (dom) => {
    let _class = 'val-illegal'
    if(!hasClass(dom, _class)) {
      dom.className += ' ' + _class
    }
}

const removeClass = (dom) => {
    let _class = 'val-illegal'
    let reg = new RegExp('(\\s|^)' + _class + '(\\s|$)')
    if(hasClass(dom, _class)){
        dom.className = dom.className.replace(reg, ' ')
    }
}

const verMsg = (success, msg) => { 
    return {success: success, msg: msg} 
}

const addTip = (dom) => {
    let tip = document.createElement("i")
    tip.style.position = 'absolute'
    tip.style.display = 'none'
    tip.style.lineHeight = tipHeight + 'px'
    tip.style.fontSize = tipHeight/2 + 'px'
    tip.style.color = '#E27171'
    tip.style.top = '0'
    tip.style.right = tipHeight/4 + 'px'
    tip.className = 'el-icon-error'

    dom.appendChild(tip)

    return tip
}

var _rules = {
    'require': {
        'ruleExp': /.+/,
        'tips': '该信息为必填项，请填写！',
        'error': '对不起，必填信息不能为空，请填写！'
    },
    'username': {
        'ruleExp': /^[\u4E00-\u9FA5A-Za-z0-9_\ ]{5,20}$/i,
        'tips': "5~20个字符，由中文、英文字母和下划线组成。",
        'error': "对不起，用户名格式不正确。这确的格式如：“robert_yao” 或者 “创业街商户”。"
    },
    'password': {
        'ruleExp': /^[a-zA-Z0-9\_\-\~\!\%\*\@\#\$\&\.\(\)\[\]\{\}\<\>\?\\\/\'\"]{3,20}$/,
        'tips': "3~20个字符，由英文字母，数字和特殊符号组成。",
        'error': "对不起，您填写的密码有误。"
    },
    'number': {
        'ruleExp': /^[-+]?(0|[1-9]\d*)(\.\d+)?$/,
        'tips': '请输入数字！',
        'error': '对不起，您填写的不是数字。'
    },
    'positiveInteger': {
        'ruleExp': /^[0-9]*[1-9][0-9]*$/,
        'tips': '请输入正整数！',
        'error': '对不起，您填写的不是正整数。'
    },
    'positiveNumber': {
        'ruleExp': /^[0-9]+(\.[0-9]{2})?$/,
        'tips': '请输入正数！',
        'error': '对不起，您填写的不是正数。'
    },
    'nonnegativeInteger':{
        'ruleExp':/^[1-9]\d*|0$/,
        'tips': '请输入非负整数！',
        'error': '对不起，您填写的不是非负整数。'
    },
    'date': {
        'ruleExp': /^\d{4}\-\d{2}-\d{2}$/,
        'tips': '请填写日期！格式为：1989-09-23',
        'error': '对不起，您填写的日期格式不正确.'
    },
    'money': {
        'ruleExp': /^[-+]?(0|[1-9]\d*)(\.\d+)?$/,
        'tips': '请输入金额！',
        'error': '金额格式不正确。正确格式如：“60” 或 “60.5”。'
    },
    'per': {
        'ruleExp': /^(?:[1-9][0-9]?|100)(?:\.[0-9]{1,2})?$/,
        'tips': '请输入百分比！',
        'error': '对不起，您填写的百分比格式不正确！'
    },
    'email': {
        'ruleExp': /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        'tips': '请输入您常用的E-mail邮箱号，以便我们联系您！',
        'error': '对不起，您填写的E-mail格式不正确！正确的格式：yourname@gmail.com。',
    },
    'phone': {
        'ruleExp': /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/,
        'tips': '请输入可以联系到您常用的电话号码！',
        'error': '对不起，您填写的电话号码格式不正确！'
    },
    'mobile': {
        'ruleExp': /^[1-9]\d{10}$/,
        'tips': '请输入可以联系到您的手机号码！',
        'error': '对不起，您填写的手机号码格式不正确！'
    },
    'url': {
        'ruleExp': /^(http|https):\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/,
        'tips': '请输入网站地址！',
        'error': '对不起，您填写的网站地址格式不正确！正确的网站地址如：http://www.yourdomain.com/。'
    },
    'ip': {
        'ruleExp': /^(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5])$/,
        'tips': '请输入IP地址！',
        'error': '对不起，您填写的IP地址格式不正确！正确的IP地址如：192.168.1.1。'
    },
    'zip': {
        'ruleExp': /^[1-9]\d{5}$/,
        'tips': '请输入邮政编码！',
        'error': '对不起，您填写的邮政编码格式不正确！正确的邮政编码如：430051。'
    },
    'english': {
        'ruleExp': /^[A-Za-z]+$/,
        'tips': '请输入英文字母！',
        'error': '对不起，您填写的内容含有英文字母（A-Z,a-z）以外的字符！'
    },
    'chinese': {
        'ruleExp': /^[\u4E00-\u9FA5]+$/,
        'tips': '请输入中文字符！',
        'error': '对不起，您填写的内容含非中文字符！'
    },
    'ce': {
        'ruleExp': /^[-\w\u4E00-\u9FA5]+$/,
        'tips': '请输入中文或英文或数字字符！',
        'error': '对不起，您填写的内容不正确！'
    },
    'integer': {
        'ruleExp': /^[-\+]?\d+$/,
        'tips': '请输入整数！',
        'error': '对不起，您填写的内容不是整数！'
    },
    'idcard': {
        'ruleExp': /(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3})|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])(\d{4}|\d{3}[x]))$/,
        'tips': '请输入身份证号码！',
        'error': '对不起，您填写的身份证号码格式不正确！'
    },
    'code': {
        'ruleExp': /^[a-zA-Z\d]+$/,
        'tips': "请填写字母或数字!",
        'error': "对不起，请填写非中文字符!"
    },
    'fax': {
        'ruleExp': /^(\d{3,4}-)?\d{7,8}$/,
        'tips': "请填写传真号码!",
        'error': "对不起，请填写传真号码!"
    }
}