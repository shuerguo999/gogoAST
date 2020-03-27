// tmpl的待补充


// js
const GG = require('../main');
const code = `
    const g = 'Hello World';
`
const AST = GG.createAstObj(code);
const { nodePathList, matchWildCardList } = AST.getAstsBySelector(`const $_$ = $_$`);
console.log(nodePathList, matchWildCardList);

AST.replaceSelBySel(`const $_$ = $_$`, `const join = function () {
    return $_$ + $_$
}`);

console.log(AST.generate());

const newAst = GG.buildAstByAstStr(`
    function g () {
        if (true) {
            '$_$body$_$'
        }
    }
`, {
    body: nodePathList[0].node
})

console.log(GG.generate(newAst))
