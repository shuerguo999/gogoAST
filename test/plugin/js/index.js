// const recast = require('recast')
// const babelParse = require('@babel/parser');
// const asttypes = require('ast-types');

// const code = `
//     const a = {
//         b: calc
//     }
// `
// const ast = recast.parse(code, {
//     parser: {
//         parse(code) {
//             return babelParse.parse(code);
//         }
//     }
// })

// asttypes.visit(ast, {
//     visitIdentifier(path) {
//         if (path.node.name == 'calc') {
//             path.replace(asttypes.builders.identifier('cal'))
//         }
//         this.traverse(path)
//     }
// })

// const res = recast.print(ast).code;
// var a = 1






const G = require('gogoast');
G.runJsPlugin({
    pluginDir: 'test/plugin/js',
    codeList: [`var a = {
        b: calc
    };`,
    `export default function calculateData(a, b){
        c
        d
    };`]
}).then(res => {
    console.log(res)
})