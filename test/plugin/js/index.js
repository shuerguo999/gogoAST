const G = require('gogoast');
G.runJsPlugin({
    pluginDir: 'test/plugin/js',
    codeList: [`export default function calculateData(a, b){
        a
        b
    };`, `var a = b;`]
}).then(res => {
    console.log(res)
})