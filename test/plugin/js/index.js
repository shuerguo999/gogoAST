const code = `var a = 1`
const GG = require('../../../main-old.js');
const AST = GG.createAstObj(code, { plugins: ['jsx']});

// const { nodePathList, matchWildCardList } = AST.getAstsBySelector('export const $_$: IRouterMap = { }')
const asts = AST.getAstsBySelector('var $_$ = 1')
var a 


// const { nodePathList, matchWildCardList } = AST.getAstsBySelector(
//   `this.state = {
//     '$_$': $_$
//   };`, false)

//   matchWildCardList.forEach(item => {
//     ///
//     const { nodePathList1, matchWildCardList1 } = AST.getAstsBySelector([
//       `const ${item} = $_$`, `let arrList = $_$`, `{ arrList: '$_$' }`
//   ], false)
//   })

// try {
    // if (nodePathList.length) {
    //     nodePathList.forEach(path => {
    //         console.log(GG.generate(path.node))
    //         // if (path.node && path.node.declarations) {
    //         //     console.log(path.node.declarations[0].id.name)
    //         //     path.node.declarations[0].id.name = 'arrList111'
    //         //     console.log(GG.generate(path.node))
    //         // }
    //     })
    // }
// } catch(e) {
//     console.log(e)
// }



// const code = `
//     import 'a.css';
//     import 'main.scss';
//     `
    
// const GG = require('gogoast');
// const AST = GG.createAstObj(code);

// const { nodePathList, matchWildCardList } = AST.getAstsBySelector(`import '$_$'`);
// matchWildCardList.forEach(item => {
//     if (item[0].value.match('main.scss')) {
//         item[0].structure.value = item[0].structure.value.replace('.scss', '.css');
//     }
// })

// const res = AST.generate();
// var a = 1
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






// const G = require('gogoast');
// G.runJsPlugin({
//     pluginDir: 'test/plugin/js',
//     codeList: [
//     `function a(a){
//         var b = 1
//         aaaas
//     }`,
//     `navigateToOutside({
//         spmc: this.el.attr('data-spm'),
//         spmd: 'd_link',
//         url: this.options.link
//       });`,
//     `export default function calculateData(a, b){
//         console.log(11);
//     };`,
//     `var a = {
//         b: calc
//     };`]
// }).then(res => {
//     console.log(res)
// })