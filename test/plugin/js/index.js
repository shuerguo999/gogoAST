const G = require('../../../main');
G.runJsPlugin({
    pluginDir: 'test/plugin/js',
    codeList: [`var a = 1`, `test/test.js`]
}).then(res => {
    console.log(res)
})