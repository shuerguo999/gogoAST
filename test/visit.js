// tmpl的待补充


// js
const GG = require('../main');
const code = `
    module.exports = function() {
        const g = 'Hello World';
        var c = a.b();
        var d = a;
        var e = a.b.c.d(f.e());
        this.dd
        function test() {
            console.log(this.test);
        }
        let lll = 1;
    }
`
const ast = GG.createAstObj(code);
const { nodePathList: p1, matchWildCardList: e1 } = ast.getAstsBySelector(`$_$`);
const { nodePathList: p2, matchWildCardList: e2 } = ast.getAstsBySelector(`$_$.$_$`, false);
p1.forEach((p, index) => {
    const e = e1[index];
    console.log(`${e[0].value}----${p.name}`)
})
const { nodePathList, matchWildCardList } = ast.getAstsBySelector({ type: 'ThisExpression'});
ast.visit({
    visitMemberExpression(path) {
        // console.log(path.node)
        this.traverse(path);
    },
    visitThisExpression(path) {
        // console.log(path.node)
        this.abort();
    },

    visitFunction(path) {
        // console.log(path.node)
        return false;
    }
});
ast.traverse(node => {
    // console.log(node);
})