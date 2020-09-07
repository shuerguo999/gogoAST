const G = require('gogoast')
module.exports = {
    // dep: ['test/plugin/js/ruleB.js'],
    dep: [],
    go(ast, filePath) {
        // ast.replaceSelBySel(`let $_$ = $_$`, `const $_$ = $_$`)
        // const { nodePathList } = ast.getAstsBySelector(`Component({
            
        // })`)
        // nodePathList[0].value.arguments[0].properties[0].params.push(
        //     G.buildAstByAstStr(`option = {}`)
        // )
        // // var a = G.buildAstByAstStr('this.el = $(`#${this.id}`);this.options = options;')
        // var body = G.createAstObj(nodePathList[0].value.arguments[0].properties[0])
        // const { nodePathList: aa, matchWildCardList: bb } = 
        // body.removeAst(`var $_$ = $_$`)
        // body.replace(`calculateData($_$)`, `this.options`)
        // body.replace(`this.data = $_$`, `this.options = Object.assign(options, $_$)`)
        // body.replace(`this.data`, `this.options`)
        // const { nodePathList: a, matchWildCardList } = body.getAstsBySelector(``)
        // const { nodePathList } = ast.getAstsBySelector(`this.data = $_$`);
        //       nodePathList.forEach((item, i) => {
        //         const right = item.value.right;
        //         if( (right.type === 'CallExpression' && right.callee.name === 'calculateData') ) {
        //           nodePathList[i].node.right = G.buildAstByAstStr('options').expression;
        //         }
        //       });

        // ast.replaceSelBySel(`export default function calculateData($_$){$_$}`, `function calculateData($_$){$_$}`, false);
        // var b = 1;
    }
}