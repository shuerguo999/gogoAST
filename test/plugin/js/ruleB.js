module.exports = {
    dep: [],
    go(ast, { filePath }) {
        ast.replaceSelBySel(`calc`, `cal`)
        ast.replaceSelBySel(`var $_$ = $_$`, `let $_$ = $_$`)
    }
}