const getSelector = require('./get-selector');
const find = require('./find');
const parse = require('./parse');
const generate = require('./generate');

const api = {
    // 通过选择器获取，返回ast片段
    getAstsBySelector(ast, selector, deep, strictSequence = true) { 
        //strictSequence作用：
            // 有的时候数组不要求顺序，如{a:$_$}匹配{b:1, a:2}
            // 有的时候需要，如function($_$, $_$)匹配function(a, b) {}
        if (!Array.isArray(selector)) {
            selector = [selector];
        }
        let pathList = [];
        let extraDataList = [];
        const selectorAst = selector.map(item => getSelector(item))
        selectorAst.forEach(item => {
            const res = find.call(ast, item.nodeType, item.structure, deep, strictSequence);
            res.pathList.forEach((p, i) => {
                if (!p.pass) { // 去重
                    pathList.push(p);
                    extraDataList.push(res.extraDataList[i]);
                    p.pass = true;
                }
            });
        });
        pathList.forEach(p => delete p.pass);
        return {
            pathList,
            extraDataList
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
            const { pathList } = api.getAstsBySelector(child, childSelector, 'nn');
            if (pathList.length > 0) {
                return true;
            }
        }
    },
    buildAstByAstStr(str, astPatialMap = {}, isProgram = false) {
        const ast = parse(str);
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
            // console.log(valueAst.node)
            const keyAst = getSelector(`'$_$${key}$_$'`);
            const { pathList } = find.call(ast, 'StringLiteral', keyAst.structure, 'nn');
            if (pathList.length > 0) {
                pathList[0].replace(valueAst)
            }
        }
        return ast;
    },
    replaceAstByAst(oldAst, newAst) {
        oldAst.replace(newAst)
    },
    replaceSelBySel(ast, selector, replacer) {
        // 用于结构不一致的，整体替换
        const { pathList, extraDataList } = api.getAstsBySelector(ast, selector, 'nn', true);
        pathList.forEach((path, i) => {
            const extra = extraDataList[i];
            if (extra.length > 0) {
                newReplacer = replacer;
                extra.forEach(v => {
                    newReplacer = newReplacer.replace('$_$', generate(v.structure));
                        // 通过选择器替换ast，返回完整ast
                });
                let replacerAst = api.buildAstByAstStr(newReplacer);
                path && path.replace(replacerAst);
            } else {
                let replacerAst = replacer.type ? replacer : api.buildAstByAstStr(replacer);
                path && path.replace(replacerAst);
            }
        });
    },
    modifySelBySel(ast, selector, replacer) {
        // 用于结构完全一致的
        // 通过选择器替换ast，返回完整ast
        const selectorAst = getSelector(selector);
        const replacerAst = getSelector(replacer);
        const { pathList, extraDataList } = find.call(ast, selectorAst.nodeType, selectorAst.structure, 'nn');
        
        // console.log(pathList);
        pathList.forEach(path => {
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
        const selectorAst = getSelector(selector);
        // bug
        // console.log(selectorAst)
        const { pathList } = find.call(ast, selectorAst.nodeType, selectorAst.structure, 'nn');
        // console.log(pathList)
        pathList.forEach(path => {
            // 多条语句逗号分割的话，只删除一个；一条语句的话，删除父节点
            if (path.parentPath.value.length == 1) {
                path.parent.replace(null);
            } else {
                path.replace(null)
            }
        });
    }
}

function isObject(value) {
    return typeof value === 'object' && value;
}

const hasOwn = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);


module.exports = api;