// tmpl的待补充


// js
const GG = require('../main');
const code = `
    module.exports = function() {
        const g = 'Hello World';
        var c = a.b();
        this.dd
        function test() {
            console.log(this.test);
        }
    }
`
const ast = GG.createAstObj(code);
const { nodePathList, matchWildCardList } = ast.getAstsBySelector({ type: 'ThisExpression'});
ast.visit({
    visitMemberExpression(path) {
        console.log(path.node)
        this.traverse(path);
    },
    visitThisExpression(path) {
        console.log(path.node)
        this.abort();
    },

    visitFunction(path) {
        console.log(path.node)
        return false;
    }
});