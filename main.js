const parse = require('./lib/parse');
const generate = require('./lib/generate');
const api = require('./lib/api');
const build = require('./lib/build-node');
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
        return api.getAstsBySelector.call(this, this.ast, ...Array.from(arguments));
    }
    replaceStrByAst() {
        return api.replaceStrByAst.call(this, this.ast, ...Array.from(arguments));
    }  
    replaceSelBySel() {
        return api.replaceSelBySel.call(this, this.ast, ...Array.from(arguments));
    }
    modifySelBySel() {
        return api.modifySelBySel.call(this, this.ast, ...Array.from(arguments));
    }
    removeAst() {
        return api.removeAst.call(this, this.ast, ...Array.from(arguments));
    }
    appendJsxAttr() {
        return api.appendJsxAttr.call(this, this.ast, ...Array.from(arguments));
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