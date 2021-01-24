const parse = require('./lib/parse');
const generate = require('./lib/generate');
const core = require('./lib/api');
const build = require('./lib/build-node');

class AST {
    constructor(nodePath, { parseOptions, wildCard, rootNode }) {
        if (nodePath) {
            this[0] = {
                nodePath, parseOptions, wildCard
            }
        }
        // rootNode todo
        this.rootNode = rootNode;
    }
    each(callback) {
        let i = 0;
        while (this[i]) {
            const { nodePath, parseOptions, wildCard } = this[i]
            this[i] = callback(new AST(nodePath, { parseOptions, wildCard, rootNode: this.rootNode}), i)[0] || null;
            i++;
        }
        return this
    }
    find(selector, options = {}) {
        const { nodePath, parseOptions } = this[0];
        if (typeof selector !== 'string') {
            throw new Error('invald selector input!');
        }
        const pOptions = options.parseOptions || parseOptions;
        const {nodePathList, matchWildCardList } = core.getAstsBySelector(
            nodePath.node, 
            selector, {
                strictSequence: !options.ignoreSequence,
                parseOptions: pOptions
            }
        );
        resetAST(this);
        nodePathList.forEach((nodePath, i) => {
            this[i] = { nodePath, parseOptions: pOptions, wildCard: matchWildCardList[i] };
        })
        return this;
    }
    parent(level = 0) {
        if (!this[0]) {
            return null;
        }
        if (!this[0].parentList) {
            this.initParent()
        }
        const parent = this[0].parentList[level]
        const { parseOptions } = this[0]
        resetAST(this);
        if (parent) {
            this[0] = { nodePath: parent, parseOptions };
            return this;
        } else {
            return null;
        }
    }
    parents() {
        if (!this[0]) {
            return null;
        }
        if (!this[0].parentList) {
            this.initParent()
        }
        const { parentList, parseOptions } = this[0];
        resetAST(this)
        parentList.forEach((nodePath, i) => {
            this[i] = { nodePath, parseOptions, wildCard: null };
        })
        return this;
    }
    initParent() {
        this[0].parentList =  core.getParentListByAst(this[0].nodePath)
        return this[0].parentList
    }
    root() {
        const parseOptions = this[0].parseOptions;
        resetAST(this)
        this[0] = { nodePath: this.rootNode, parseOptions }
        this.rootNode = null;
        return this;
    }
    has(selector, options) {
        return !!this.find(selector, options)[0]
    }
    initSiblings() {
        const parentList = this.initParent();
        const parseOptions = this[0].parseOptions;
        let getArrayParent = false;
        let i = 0;
        let siblings = [];
        let prevAll = [];
        let nextAll = [];
        let selfPathNode = this[0].nodePath.value;
        while(!getArrayParent) {
            if (!parentList[i] || !parentList[i].value) {
                getArrayParent = true;
            } else if (Array.isArray(parentList[i].value)) {
                getArrayParent = true;
                let isPrev = true;
                parentList[i].value.forEach(nodePath => {
                    if (nodePath == selfPathNode) {
                        // 排除自身节点
                        isPrev = false;
                    } else {
                        siblings.push({ nodePath, parseOptions })
                        if (isPrev) {
                            prevAll.push({ nodePath, parseOptions })
                        } else {
                            nextAll.push({ nodePath, parseOptions })
                        }
                    }
                })
                this[0].siblings = siblings;
                this[0].prevAll = prevAll;
                this[0].nextAll = nextAll;
            }
            selfPathNode = parentList[i].value;
            i++
        }
    }
    siblings() {
        if (!this[0]) {
            return null;
        }
        if (!Array.isArray(this[0].siblings)) {
            this.initSiblings();
        }
        const siblings = this[0].siblings || [];
        resetAST(this);
        siblings.forEach((sibling, i) => {
            this[i] = sibling
        });
        return this;
    }
    prevAll() {
        if (!this[0]) {
            return null;
        }
        if (!Array.isArray(this[0].siblings)) {
            this.initSiblings();
        }
        const prevAll = this[0].prevAll || [];
        resetAST(this);
        prevAll.forEach((prev, i) => {
            this[i] = prev
        });
        return this;
    }
    prev() {
        if (!this[0]) {
            return null;
        }
        if (!Array.isArray(this[0].siblings)) {
            this.initSiblings();
        }
        const prevAll = this[0].prevAll || [];
        resetAST(this);
        this[0] = prevAll[prevAll.length - 1];
        return this;
    }

    nextAll() {
        if (!this[0]) {
            return null;
        }
        if (!Array.isArray(this[0].siblings)) {
            this.initSiblings();
        }
        const nextAll = this[0].nextAll || [];
        resetAST(this);
        nextAll.forEach((next, i) => {
            this[i] = next
        });
        return this;
    }
    next() {
        if (!this[0]) {
            return null;
        }
        if (!Array.isArray(this[0].siblings)) {
            this.initSiblings();
        }
        const nextAll = this[0].nextAll || [];
        resetAST(this);
        this[0] = nextAll[0];
        return this;
    }
    
    eq(index) {
        const { nodePath, parseOptions, wildCard } = this[index] || {}
        resetAST(this);
        this[0] = { nodePath, parseOptions, wildCard }
        return this;
    }
    clone() {
        if (!this[0]) {
            return;
        }
        const nodePath = new NodePath(
            JSON.parse(JSON.stringify(this[0].nodePath.node)), 
            this[0].nodePath.parent, 
            this[0].nodePath.parentPath 
        )
        const { parseOptions, wildCard } = this[0]
        resetAST(this);
        this[0] = { nodePath, parseOptions, wildCard }
        return this;
    }
    replace(selector, replacer, { ignoreSequence, parseOptions } = {}) {
        if (!this[0]) {
            throw new Error('invald call!');
        }
        core.replaceSelBySel(this[0].nodePath, selector, replacer, !!ignoreSequence, parseOptions)
        return this;
    }
    replaceBy(replaceAst) {
        if (!this[0]) {
            throw new Error('invald call!');
        }
        if (replaceAst[0] && replaceAst[0].nodePath) {
            replaceAst = replaceAst[0].nodePath.node
        }
        let i = 0;
        while(this[i]) {
            core.replaceAstByAst(this[i].nodePath, replaceAst)
            i++
        }
        
        return this;
    }
    insertSiblingNode(node, type) {
        if (!this[0]) {
            return null;
        }
        if (!this[0].parentList) {
            this.initParent()
        }
        const parentList = this[0].parentList;
        let getArrayParent = false;
        let i = 0;
        let selfPathNode = this[0].nodePath.value;
        let selfIndex = -1;
        while(!getArrayParent) {
            if (!parentList[i] || !parentList[i].value) {
                getArrayParent = true;
            } else if (Array.isArray(parentList[i].value)) {
                getArrayParent = true;
                parentList[i].value.forEach((nodePath, index) => {
                    if (nodePath == selfPathNode) {
                        selfIndex = index;
                    }
                })
                if (type == 'after') {
                    parentList[i].value.splice(selfIndex + 1, 0, node)
                } else {
                    parentList[i].value.splice(selfIndex, 0, node)
                }
            }
            selfPathNode = parentList[i].value;
            i++
        }
    }
    after(node) {
        if (node[0] && node[0].nodePath) {
            node = node[0].nodePath.value
        }
        this.insertSiblingNode(node, 'after');
        return this;
    }
    before(node) {
        if (node[0] && node[0].nodePath) {
            node = node[0].nodePath.value
        }
        this.insertSiblingNode(node, 'before');
        return this;
    }
    insertChildNode(node, type) {
        if (!this[0] || !this[0].nodePath) {
            return;
        }
        let selfNode = this[0].nodePath.value;
        if (!Array.isArray(selfNode)) {
            return;
            // for(let key in selfNode) {
            //     if (Array.isArray(selfNode[key])) {
            //         selfNode = selfNode[key]
            //     }
            // }
        }
        if (type == 'append') {
            selfNode.push(node);
        } else {
            selfNode.unshift(node);
        }
    }
    append(node) {
        if (typeof node == 'string') {
            node = core.buildAstByAstStr(node)
        }
        if (node[0] && node[0].nodePath) {
            node = node[0].nodePath.value
        }
        this.insertChildNode(node, 'append')
        return this;

    }
    prepend(node) {
        if (typeof node == 'string') {
            node = parse(node)
        }
        if (node[0] && node[0].nodePath) {
            node = node[0].nodePath.value
        }
        this.insertChildNode(node, 'prepend')
        return this;
    }
    empty() {
        if (Array.isArray(this[0].nodePath.value)) {
            this[0].nodePath.value = [];
        }
        return this
    }
    remove() {
        if (!this[0]) {
            throw new Error('invald call!');
        }
        core.removeAst(this.root, this[0].nodePath)
    }
    generate() {
        if (!this[0]) {
            throw new Error('invald call!');
        }
        return generate(this[0].nodePath.value)
    }
}

function resetAST(ast) {
    let i = 0;
    while (ast[i]) {
        delete ast[i];
        i++
    }
}
class NodePath {
    constructor(node, parent, parentPath) {
        this.node = node;
        this.parent = parent || null;
        this.parentPath = parentPath || null;
        this.value = node;
    }
}

const main = (code = '', options = {}) => {
    let node;
    let nodePath;
    let parseOptions;
    let wildCardMap;

    if (typeof options.parseOptions == 'object') {
        parseOptions = options.parseOptions
    }

    if (typeof options.wildCardMap == 'object') {
        wildCardMap = options.wildCardMap
    }

    if (wildCardMap) {
        // ast与字符串混合生成ast
        if (typeof code == 'string') {
            node = core.buildAstByAstStr(code, wildCardMap, {
                isProgram: !!options.isProgram,
                parseOptions: parseOptions
            })
            nodePath = new NodePath(node);
        }
    } else {
        if (typeof code == 'string') {
            node = parse(code, options)
            nodePath = new NodePath(node);
        } else if (code.type) {
            // 传入ast node对象
            nodePath = new NodePath(node);
        } else if (code.node && code.parent) {
            // 传入nodePath对象
            nodePath = code;
        } else {
            throw new Error('invalid input! accept code / ast node / nodePath')
        }
    }

    return new AST(nodePath, { parseOptions, rootNode: nodePath })
}

module.exports = main;