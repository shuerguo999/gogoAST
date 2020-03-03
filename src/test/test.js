// tmpl的待补充


// js
const GG = require('../../main');
const code = `
    const g = 'Hello World';
`
const G = GG.createAstObj(code);
const { pathList, extraDataList } = G.getAstsBySelector(`const $_$ = $_$`);
console.log(pathList, extraDataList);

G.replaceSelBySel(`const $_$ = $_$`, `const join = function () {
    return $_$ + $_$
}`);

console.log(G.generate());

const newAst = GG.buildAstByAstStr(`
    function g () {
        if (true) {
            '$_$body$_$'
        }
    }
`, {
    body: pathList[0].node
})

console.log(newAst.generate())
