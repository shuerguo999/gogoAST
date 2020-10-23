const getSelector = require('./get-selector');
const { find, visit } = require('./find');
const parse = require('./parse');
const generate = require('./generate');
const filterProps = [
    'computed',
    'range',
    'loc',
    'type',
    'raw',
    'start',
    'end',
    'leadingComments',
    'shorthand',
    'extra',
    'static',
    'type',
    'original'
]
const api = {
    // 通过选择器获取，返回ast片段
    getAstsBySelector(ast, selector, strictSequence = true, deep, parseOptions) { 
        //strictSequence作用：
            // 有的时候数组不要求顺序，如{a:$_$}匹配{b:1, a:2}
            // 有的时候需要，如function($_$, $_$)匹配function(a, b) {}
        if (!Array.isArray(selector)) {
            selector = [selector];
        }
        let nodePathList = [];
        let matchWildCardList = [];
        const selectorAst = selector.map(item => getSelector(item, this.parseOptions || parseOptions))
        selectorAst.forEach(item => {
            const res = find.call(ast, item.nodeType, item.structure, strictSequence, deep);
            res.nodePathList.forEach((p, i) => {
                if (!p.pass) { // 去重
                    nodePathList.push(p);
                    matchWildCardList.push(res.matchWildCardList[i]);
                    p.pass = true;
                }
            });
        });
        nodePathList.forEach(p => delete p.pass);
        return {
            nodePathList,
            matchWildCardList,
            pathList: nodePathList,
            extraDataList: matchWildCardList
        };
    },
    getParentListByAst(path) {
        const list = [];
        while(path && path.parentPath) {
            list.push(path.parentPath);
            path = path.parentPath;
        }
        return list
    },
    getPrevAst(path) {
        let parent = path.parentPath;
        while(parent.value && !Array.isArray(parent.value)) {
            path = parent;
            parent = parent.parentPath;
        }
        parent = parent.value;
        if (parent) {
            const index = parent.indexOf(path.node);
            if (index > 0) {
                return parent[index - 1];
            } else return null;
        }
        return null;
    },
    getNextAst(path) {
        let parent = path.parentPath;
        while(parent.value && !Array.isArray(parent.value)) {
            path = parent;
            parent = parent.parentPath;
        }
        parent = parent.value;
        if (parent) {
            const index = parent.indexOf(path.node);
            if (parent[index + 1]) {
                return parent[index + 1];
            } else return null;
        }
        return null;
    },
    hasChildrenSelector(path, childSelector) {
        const childCache = path.__childCache || {};
        for (childKey in childCache) {
            if (['type', 'directives'].indexOf(childKey) > -1) {
                continue;
            }
            const child = childCache[childKey];
            const { nodePathList } = api.getAstsBySelector(child, childSelector);
            if (nodePathList.length > 0) {
                return true;
            }
        }
    },
    buildAstByAstStr(str, astPatialMap = {}, { isProgram = false, parseOptions }) {
        const ast = parse(str, parseOptions);
        const program = api.replaceStrByAst(ast, astPatialMap);
        if (program) {
            if (isProgram) {
                return program;
            } else {
                if (program.program.body.length > 1) {
                    return program.program.body
                } else if (program.program.body.length == 1) {
                    return program.program.body[0];
                } else {
                    return program.program.comments[0];
                }
            }
        } else {
            return null;
        }
    },
    replaceStrByAst(ast, astPatialMap = {}) {
        for (let key in astPatialMap) {
            const valueAst = astPatialMap[key];
            const { nodePathList } = api.getAstsBySelector(ast, [
                { type: 'Identifier', name: `$_$${key}$_$` },
                { type: 'StringLiteral', value: `$_$${key}$_$` }
            ]);
            if (nodePathList.length > 0) {
                nodePathList[0].replace(valueAst)
            }
        }
        return ast;
    },
    replaceAstByAst(oldAst, newAst) {
        oldAst.replace(newAst)
    },
    replaceSelBySel(ast, selector, replacer, strictSequence = true, parseOptions) {
        // 用于结构不一致的，整体替换
        const { nodePathList, matchWildCardList } = api.getAstsBySelector(ast, selector, strictSequence, 'nn', this.parseOptions || parseOptions);
        nodePathList.forEach((path, i) => {
            const extra = matchWildCardList[i];
            if (extra.length > 0) {
                let newReplacer = replacer;
                extra.forEach(v => {
                    newReplacer = newReplacer.replace('$_$', generate(v.structure));
                        // 通过选择器替换ast，返回完整ast
                });
                if (!replacer) {
                    path.replace(null);
                } else {
                    let replacerAst = api.buildAstByAstStr(newReplacer);
                    if (replacerAst.expression && replacerAst.expression.type != 'AssignmentExpression') {
                        replacerAst = replacerAst.expression
                    }
                    path && path.replace(replacerAst);
                }
            } else {
                if (!replacer) {
                    path.replace(null);
                } else {
                    let replacerAst = replacer.type ? replacer : api.buildAstByAstStr(replacer);
                    if (replacerAst.expression && replacerAst.expression.type != 'AssignmentExpression') {
                        replacerAst = replacerAst.expression
                    }
                    path && path.replace(replacerAst);
                }
            }
        });
    },
    modifySelBySel(ast, selector, replacer) {
        // 用于结构完全一致的
        // 通过选择器替换ast，返回完整ast
        const selectorAst = getSelector(selector, this.parseOptions);
        const replacerAst = getSelector(replacer, this.parseOptions);
        const { nodePathList, matchWildCardList } = find.call(ast, selectorAst.nodeType, selectorAst.structure, true, 'nn');
        
        // console.log(nodePathList);
        nodePathList.forEach(path => {
            replaceAttr(path.value, replacerAst.structure);
        });

        function replaceAttr(path, replacerStructure) {
            if (isObject(path) && isObject(replacerStructure)) {
                for(const key in replacerStructure) {
                    if (!hasOwn(path, key)) return;
                    const value = replacerStructure[key];
                    if (isObject(value)) {
                        replaceAttr(path[key], value);
                    } else if (value != '$_$') {
                        path[key] = value;
                    }
                }
            }
        }
    },
    insertAstListBefore(path, nodeList) {
        if (!Array.isArray(nodeList)) {
            nodeList = [nodeList]
        }
        for (let i = 0; i< 3; i++) {
            const pNode = path.parentPath;
            if (pNode && pNode.value && Array.isArray(pNode.value)) {
                const index = pNode.value.indexOf(path.value);
                nodeList.reverse().forEach(item => {
                    pNode.value.splice(index, 0, item);
                });
                i = 3
            } else {
                path = pNode;
            }
        }
    },
    insertAstListAfter(path, nodeList) {
        if (!Array.isArray(nodeList)) {
            nodeList = [nodeList]
        }
        for (let i = 0; i< 3; i++) {
            const pNode = path.parentPath;
            if (pNode && pNode.value && Array.isArray(pNode.value)) {
                const index = pNode.value.indexOf(path.value) + 1;
                nodeList.reverse().forEach(item => {
                    pNode.value.splice(index, 0, item);
                });
                i = 3
            } else {
                path = pNode;
            }
        }
    },
    removeAst(ast, selector) {
        const selectorAst = getSelector(selector, this.parseOptions);
        // bug
        // console.log(selectorAst)
        const { nodePathList } = find.call(ast, selectorAst.nodeType, selectorAst.structure, true, 'nn');
        // console.log(nodePathList)
        nodePathList.forEach(path => {
            // 多条语句逗号分割的话，只删除一个；一条语句的话，删除父节点
            if ((!path.parentPath.value.length) || path.parentPath.value.length == 1) {
                path.parent.replace(null);
            } else {
                path.replace(null)
            }
        });
    },
    appendJsxAttr(ast, obj) {
        const attrs = [];
        for (let o in obj) {
            attrs.push(`${o}=${obj[o]}`.replace(/'\$'/g, "$"));
        }
        const jsxPartial = buildAstByAstStr(`<div ${attrs.join(' ')}></div>`);
        const newAttrs = jsxPartial.expression.openingElement.attributes;
        ast.value.openingElement.attributes = ast.value.openingElement.attributes.concat(newAttrs);
    },
    visit() {
        visit.call(this, ...Array.from(arguments));
    },
    traverse(node, cb) {
        if (node.type && typeof node.type == 'string') {
            // 是一个ast节点,且不是token
            if (['File', 'Program'].indexOf(node.type) == -1) {
                cb(node);
            }
            for (let attr in node) {
                const child = node[attr];
                if (child) {
                    if (Array.isArray(child)) {
                        child.forEach(c => api.traverse(c, cb));
                    } else if (child.type) {
                        api.traverse(child, cb);
                    }
                }
            }
        }
    }
}

function isObject(value) {
    return typeof value === 'object' && value;
}

const hasOwn = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);


module.exports = api;