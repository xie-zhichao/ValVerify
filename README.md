# ValVerify

 Element-ui表单值校验插件：valVerify
 ## options: 
 *  - tipHeight: Number, tip提示的高度
 ## return: {success: success, msg: msg}
 ** 需用于绑定model的vue组件 **

 ## 指令：v-valv
 - name：表单字段名称
 - group：表单名称，可用于按表单校验
 - rule：校验规则名（内置名称看源码，支持regex/function）
 - title：自定义检验失败提示信息
 - auto：表单值变化时，是否自动校验。否则手工按表单校验

Example：
<el-input 
v-model="input"
v-valv="{name:'input', group:'form1', rule:'require'}" 
placeholder="请输入内容"></el-input>

