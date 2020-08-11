const G = require('../../../main')
module.exports = {
    dep: ['test/plugin/js/ruleB.js'],
    go(ast) {
        ast.replaceSelBySel(`let $_$ = $_$`, `const $_$ = $_$`)
    }
}