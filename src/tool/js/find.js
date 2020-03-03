// 通过简单ast结构查找ast节点

const recast= require('recast');
const visit = recast.types.visit;
const filterProps = require('./filter-prop.js');

const hasOwn = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

function checkIsMatch(full, partial, extraData, strictSequence) {
    return Object.keys(partial).every(prop => {
        if (!full || !partial) {
            // 这个分支存疑，不知道会不会有bug
            return false;
        } else 
        if (isObject(partial[prop])) {
            let res = false;
            if (Array.isArray(partial[prop]) && !strictSequence) {
                if (hasOwn(full, prop)) {
                    res = partial[prop].every(p => {
                        let a = false;
                        full[prop].forEach(f => {
                            if (f.type == 'ObjectProperty') {
                                // 兼容 { a: 1 } 匹配 { 'a': 1 } 这种情况
                                f.key.name && (f.key.value = f.key.name);
                                f.key.value && (f.key.name = f.key.value);
                            }
                            if (checkIsMatch(f, p, extraData, strictSequence)) {
                                a = true;
                            }
                        });
                        return a;
                    });
                } else {
                    res = false;
                }
            } else {
            // todo
                try{
                    res = hasOwn(full, prop) && checkIsMatch(full[prop], partial[prop], extraData, strictSequence);
                } catch(e) {
                    console.log(e)
                }
                
            }
            return res;
        } else {
            if (partial[prop] == '$_$') {
                let extra = {
                    structure: full
                };
                if (!full) return;
                switch (full.type) {
                    case 'ThisExpression':
                        extra.value = 'this';
                        break;
                    case 'StringLiteral':
                        extra.value = full.value;
                        break;
                    default:
                        if(full[prop]) {
                            extra.value = full[prop];
                        } else {
                            extra.value = {};
                            filterProps(full, extra.value);
                        }
                }
                extraData.push(extra);
                return true;
            } else if (partial[prop]) {
                const reg = /^(?:\$\[).*(?=\]\$)/;
            }
            return full ? full[prop] == partial[prop] : false;
        }
    });
}

function isObject(value) {
    return typeof value === 'object' && value;
}

function find(nodeType, structure, deep = 'nn', strictSequence = false) {
    const pathList = [];
    const extraDataList = [];
    let isMatch = false;
    const ast = this;
    visit(ast, {
        [`visit${nodeType}`](path) {
            const extraData = [];
            isMatch = checkIsMatch(path.value, structure, extraData, strictSequence);
            if (isMatch) {
                pathList.push(path);
                extraDataList.push(extraData);
            }
            switch (deep) {
                case '1':
                    this.abort();
                case 'n':
                    return false;
                case 'nn': 
                    this.traverse(path);
                default:
                    return false;
            }
        }
    });
    return { pathList, extraDataList };
}
module.exports = find;