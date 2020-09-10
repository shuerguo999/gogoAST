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
    codeList: [
    `Component({})`,
    `export default function calculateData(a, b){
        console.log(11);
    };`,
    `var a = {
        b: calc
    };`]
}).then(res => {
    console.log(res)
})