const GG = require('../main');
const fs = require('fs');
const path = 'test/lib.ts';
const code = fs.readFileSync(path).toString();
const AST = GG.createAstObj(code);     // code是源代码字符串

const { nodePathList } = AST.getAstsBySelector(`const $_$ = $_$`, true, 'n');   // 匹配到最外层的变量定义
nodePathList.forEach(p => {
  if (p.parent.node.type == 'ExportNamedDeclaration') {    // declarator类型的节点肯定至少存在两级parent，不会报错
    return;     // 已经export的不处理
  }
  GG.replaceAstByAst(p, { type: 'ExportNamedDeclaration', declaration: p.value })
})
fs.writeFileSync(path + 'output.ts', AST.generate())
