// 把简单的api转换成ast
const recast= require('recast');
const parse = require('./parse');
const visit = recast.types.visit;
const filterProps = require('./filter-prop.js');

// function parse(str) {
//     let ast = null;
//     try {
//         ast = recast.parse(selectorCode)
//     } catch (e) {
//         if (str.split(' ')[0] == 'return') {
//             const content = recast.parse(str.slice(6));
//             // return 语句
//             return parseReturn(content);
//         }
//     }
//     return ast;
// }

// function parseReturn(content) {
//     return builders.Program(
//         builders.ExpressionStatement(
//             builders.BlockStatement(
//                 builders.returnStatement(builders.identifier(promiseVarName))
//             )
//         )
//     )
// }

function getSelector(selectorCode) {
    const selector = { nodeType: '', structure: { } };
    if (typeof selectorCode != 'string') {
        // 如果是通过builders造出来的ast结构，比如return语句
        selector.nodeType = selectorCode.type;
        filterProps(selectorCode, selector.structure);
        selector.type = selectorCode.type; // 兼容只用type匹配的选择器
        return selector;
    }

    let seletorAst = parse(selectorCode);
    if (seletorAst.program.body.length == 0) {
        // 开头的字符串会被解析成directive
        return { 
            nodeType: 'StringLiteral', 
            structure: { 
                value: selectorCode.slice(1, -1)
            }
        }
    }
    visit(seletorAst, {
        visitExpressionStatement(path) {
            const expression = path.value.expression;
            selector.nodeType = expression.type;
            if (!expression) return;
            filterProps(expression, selector.structure);
            this.abort();
        },
        visitVariableDeclaration(path) {
            // 目前不考虑选择器有 var a = 1, b = 2这种 TODO
            const declaration = path.value.declarations[0];
            selector.nodeType = declaration.type;
            if (!declaration) return;
            filterProps(declaration, selector.structure);
            this.abort();
        },
        visitImportDeclaration(path) {
            const declaration = path.value;
            selector.nodeType = declaration.type;
            if (!declaration) return;
            filterProps(declaration, selector.structure);
            this.abort();
        },
        visitClassDeclaration(path) {
            const declaration = path.value;
            selector.nodeType = declaration.type;
            if (!declaration) return;
            filterProps(declaration, selector.structure);
            this.abort();
        }
    });

    return selector;
}


module.exports = getSelector;