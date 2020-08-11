const glob = require('glob');
const getCode = require('./file-tool/get-code');
const writeCode = require('./file-tool/write-code');
const { constructTree, tokenize } = require('hyntax-yx');
const generator = require('../lib/serialize-node');
const traverse = require('../lib/html-traverse');
module.exports = async function(GG, { pluginDir, codeList }) {
    const { ruleList, ruleMap } = await getRules(pluginDir);
    if (!Array.isArray(codeList)) {
        codeList = [codeList];
    }
    const res = []
    codeList.forEach((filePath, index) => {
        let isPath = true
        initRules(ruleMap);
        const file = getCode(filePath);
        let code = file ? file.toString() : '';
        if (!code) {
            code = filePath;
            isPath = false
            // codeList可以直接传js代码
        }
        const { tokens } = tokenize(code)
        const { ast } = constructTree(tokens)
        const transformMap = {
            attr: [],
            abandonAttr: [],
            tag: [],
            event: [],
            text: []
        }
        ruleList.forEach(rule => {
            transformMap[rule.go.match].push(rule.go)
        })
        traverse(ast, transformMap, isPath ? filePath : '');
        let tmpl = generator(ast);

        if (isPath) {
            const outputPath = filePath.replace('.html', `-output.html`);
            tmpl && writeCode(tmpl, outputPath);
        }
        res[index] = tmpl;
    })
    return res;
}
function initRules(ruleMap) {
    for( let r in ruleMap) {
        const rule = ruleMap[r];
        rule.status = 0;
        rule.parentFinishList = new Set();
    }
}

function getRules(pluginDir) {
    return new Promise(resolve => {
        const path = pluginDir;
        glob(`${path}/**/*.js`, {}, (err, ruleName) => {
            if (err) {
                console.error(err);
                return;
            }
            if (ruleName.length == 0) {
                console.error(`Error:${path}未匹配到文件，请检查pluginDir参数！`);
                return;
            }
            const nodeMap = {};
            const rootList = [];
            const childList = [];
            ruleName.forEach(rulefile => {
                // const Rname = rulefile.replace('.js', '').replace(path, '.');
                const Rname = '../' + rulefile;
                const R = require(Rname);
                if (!R.go) return;
                R.dep = R.dep || [];
                let rule = null;
                if (nodeMap[Rname]) {
                    rule = nodeMap[Rname];
                    rule.setGo(R.go);
                    rule.setParents(R.dep);
                } else {
                    rule = new Rule(Rname, R.go, R.dep.map(dep => 
                        '../' + dep));
                    nodeMap[Rname] = rule;
                }

                Array.isArray(R.dep) && R.dep.length && R.dep.forEach(dep => {
                    const depName = '../' + dep;
                    if (!nodeMap[depName]) {
                        nodeMap[depName] = new Rule(depName);
                    }
                    nodeMap[depName].addChild(rule);
                })
                
                if (Array.isArray(R.dep) && R.dep.length) {
                    childList.push(rule);
                } else {
                    rootList.push(rule);
                }
            });
            resolve({ ruleList: rootList, ruleMap: nodeMap});
        });
    })
}

class Rule {
    constructor(name, go, dep) {
        this.name = name;
        this.go = go || void 0;
        this.parentList = new Set(dep || []);
        this.children = new Set();
        this.parentFinishList = new Set();
        this.status = 0;
    }
    notify(parentName, {ast, filePath, modelPath}) {
        this.parentFinishList.add(parentName);
        if (this.parentFinishList.size == this.parentList.size) {
            this.handle(ast, filePath, modelPath);
        }
    }
    handle(ast, filePath, modelPath) {
        try{
            this.go(ast, filePath, modelPath);
        } catch(e) {
            console.log(e.stack);
        }
        this.status = 1;
        this.children && this.children.forEach(child => {
            child.notify(this.name, { ast, filePath, modelPath });
        })
    }
    addChild(child) {
        if (this.parentList.has(child.name)) {
            throw new Error(`${this.name}与${child.name}存在循环依赖！`);
        }
        this.children.add(child);
    }
    setGo(go) {
        this.go = go;
    }
    setParents(parentList) {
        this.parentList = new Set(parentList)
    }
}