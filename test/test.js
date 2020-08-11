// tmpl的待补充


// js
const GG = require('../main');
const code = `
    const g:string = 'Hello World';
    export const a = 1;

    const func = () => {
        const c = 1;
    }
    
`
var AST = GG.createAstObj(code);

const { nodePathList } = AST.getAstsBySelector(`const $_$ = $_$`, true, 'n');
nodePathList.forEach(n => {
    if (n.parent.parent.node.type == 'ExportNamedDeclaration') {
        return;
    }
    GG.replaceAstByAst(n.parent, { type: 'ExportNamedDeclaration', declaration: n.parent.value})
})
console.log(AST.generate())

// const { nodePathList, matchWildCardList } = AST.getAstsBySelector(`const $_$ = $_$`);
// console.log(nodePathList, matchWildCardList);

// AST.replaceSelBySel(`const $_$ = $_$`, `const join = function () {
//     return $_$ + $_$
// }`);

// console.log(AST.generate());

// const newAst = GG.buildAstByAstStr(`
//     function g () {
//         if (true) {
//             '$_$body$_$'
//         }
//     }
// `, {
//     body: nodePathList[0].node
// })



// console.log(GG.generate(newAst))
