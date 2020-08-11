const G = require('../../../main')
module.exports = {
    dep: [],
    go(ast) {
        ast.replaceSelBySel(`var $_$ = $_$`, `let $_$ = $_$`)
    }
}