const parse = require('./src/tool/js/parse');
const generate = require('./src/tool/js/generate');
const api = require('./src/tool/js/api');
const build = require('./src/tool/js/build-node');
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
        return api.getAstsBySelector.call(this, this.ast, ...arguments);
    }
    replaceStrByAst() {
        return api.replaceStrByAst.call(this, this.ast, ...arguments);
    }  
    replaceSelBySel() {
        return api.replaceSelBySel.call(this, this.ast, ...arguments);
    }
    modifySelBySel() {
        return api.modifySelBySel.call(this, this.ast, ...arguments);
    }
    removeAst() {
        return api.removeAst.call(this, this.ast, ...arguments);
    }
    appendJsxAttr() {
        return api.appendJsxAttr.call(this, this.ast, ...arguments);
    }
}
const main = {
    createAstObj: (code, options) => {
        options && (global.parseOptions = options);
        return new Ast(code, options);
    },
    generate(ast) {
        return generate(ast);
    },
    ...api,
    ...build
}
module.exports = main;