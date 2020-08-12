const G = require('gogoast');
G.runHtmlPlugin({
    pluginDir: 'test/plugin/html',
    codeList: [`<div onClick="show">111</div>`, `test/test.axml`]
}).then(res => {
    console.log(res)
})