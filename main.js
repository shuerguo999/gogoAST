const parse = require('./src/tool/js/parse');
const generate = require('./src/tool/js/generate');
const { 
    getAstsBySelector, 
    getParentListByAst, 
    hasChildrenSelector, 
    buildAstByAstStr,
    replaceStrByAst,
    replaceAstByAst,
    replaceSelBySel,
    modifySelBySel,
    removeAst
} = require('./src/tool/js/api');
const { 
    buildJsxAttrValue, 
    appendJsxAttr, 
    buildObjectProperty 
} = require('./src/tool/js/build-node');
class Ast {
    constructor(code, options) {
        if (typeof code == 'string') {
            this.ast = parse(code, options);
        } else {
            this.ast = code;
        }
    }
    generate() {
        return generate(this.ast);
    }
    getAstsBySelector() {
        return getAstsBySelector.call(this, this.ast, ...arguments);
    }
    getParentListByAst() {
        return getParentListByAst.call(this, ...arguments);
    }
    hasChildrenSelector() {
        return hasChildrenSelector.call(this, ...arguments);
    }
    buildAstByAstStr() {
        return buildAstByAstStr.call(this, ...arguments);
    }
    replaceStrByAst() {
        return replaceStrByAst.call(this, this.ast, ...arguments);
    }
    replaceAstByAst() {
        return replaceAstByAst.call(this, ...arguments);
    }
    replaceSelBySel() {
        return replaceSelBySel.call(this, this.ast, ...arguments);
    }
    modifySelBySel() {
        return modifySelBySel.call(this, this.ast, ...arguments);
    }
    removeAst() {
        return removeAst.call(this, this.ast, ...arguments);
    }
    buildObjectProperty() {
        return buildObjectProperty.call(this, ...arguments);
    }
    buildJsxAttrValue() {
        return buildJsxAttrValue.call(this, ...arguments);
    }
    appendJsxAttr() {
        return appendJsxAttr.call(this, this.ast, ...arguments);
    }
}
let i = 0;
module.exports = {
    createAstObj: (code, options) => {
        options && (global.parseOptions = options);
        const r = new Ast(code, options);
        return r;
    },
    buildJsxAttrValue() {
        return buildJsxAttrValue.call(this, ...arguments);
    },
    buildObjectProperty() {
        return buildObjectProperty.call(this, ...arguments);
    },
    buildAstByAstStr() {
        return new Ast(buildAstByAstStr.call(this, ...arguments));
    }
}