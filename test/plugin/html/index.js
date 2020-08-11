const G = require('../../../main');
G.runHtmlPlugin({
    pluginDir: 'test/plugin/html',
    codeList: [`<div onClick="show">111</div>`, `test/test.html`]
}).then(res => {
    console.log(res)
})