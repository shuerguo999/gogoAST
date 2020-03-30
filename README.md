# GOGOAST

![](https://img.alicdn.com/tfs/TB17V2NvHj1gK0jSZFuXXcrHpXa-256-256.png)

全网最简单易上手，可读性最强的AST处理工具！

# Install
- node包安装
```
    npm install gogoast
```
- 浏览器执行
    > commonjs引入gogoast.js

# 为什么你需要用gogoAST？
- 大幅减少代码量——如果你需要使用AST对代码进行升级、改造、分析，快用gogoAST帮你摆脱繁琐冗余的的代码，专注于你的核心逻辑。不需要traverse，像剥洋葱一样一层一层的对比、操作、构造ast节点。
- 降低理解成本——甚至不需要理解什么是CallExpression、Identifier、ImportDeclaration这些概念，就可以畅快运用AST。
- 基于recast，转换后的代码基本与源代码的格式差异最小。
- 凡是需要借助babel、recast、jscodeshift、esprima...完成的需求，gogoast都能帮你更快更简单的完成。

# 快速开始
- 创建一个AST对象
``` javascript
const code = `some code`
const GG = require('gogoast');
const AST = GG.createAstObj(code);
```

- 查找代码片段
用一段包含通配符（$_$）的'代码选择器'来查找相应的代码片段，如：

    - 查找代码中所有的变量
    
        ``` javascript
        const { matchWildCardList } = AST.getAstsBySelector(`$_$`);
        ```
    - 查找代码中所有的字符串
    
        ``` javascript
        const { matchWildCardList } = AST.getAstsBySelector(`'$_$'`);
        ```
    - 查找某些函数的调用
        ``` javascript
        const { nodePathList, matchWildCardList } = AST.getAstsBySelector([
            '$_$.setTip($_$, $_$)',
            'tip.show($_$)'
        ]);
        ```
    - 选择器示例：
        ``` javascript
        var $_$ = $_$
        function $_$ () { $_$ }
        View.extend($_$)
        $_$ ? $_$ : $_$
        $_$ && $_$
        ```
        
返回结果 |nodePathList | matchWildCardList|
-- |-- | :--: 
描述|代码选择器匹配到的代码片段 | 代码选择器中通配符匹配到的代码片段
结构|nodePath[]|{ stucture: node, value: simpleNode }[]
解释|nodePath对象包含匹配到的ast结构及其上下文| structure中的node是ast结构，value是简化后的node，便于取值



- 替换一段代码
1. 在完整的AST片段中，通过param1查找对应的代码片段
2. 通过param2生成一段代码，填入param1中通配符对应的代码
3. 将param2生成的代码替换param1匹配的代码
```javascript
    AST.replaceSelBySel(param1, param2);
    AST.replaceSelBySel('const $_$ = require($_$)', 'import $_$ from $_$');
```


# gogoAST与主流AST工具之对比

目前，自定义babel插件和jscodeshift是有代表性的AST工具，通过下面两个例子可以看出gogoAST的代码可读性和简洁的优势。

- 示例1: 与自定义babel插件对比

    对于下面这段js代码
    
    ```javascript
    import a from 'a';
    console.log('get A')
    var b = console.log()
    console.log.bind()
    var c = console.log
    console.log = func
    ```
    
    假如我们希望对不同的console.log做不同的处理，变成下面这样
    
    ```
    import a from 'a';
    var b = void 0;
    console.log.bind()
    var c = function(){};
    console.log = func
    ```

    - 用自定义Babel插件实现的核心代码：

    ```javascript
    // 代码来源：https://zhuanlan.zhihu.com/p/32189701
    module.exports = function({ types: t }) {
    return {
        name: "transform-remove-console",
        visitor: {
        CallExpression(path, state) {
            const callee = path.get("callee");

            if (!callee.isMemberExpression()) return;

            if (isIncludedConsole(callee, state.opts.exclude)) {
            // console.log()
            if (path.parentPath.isExpressionStatement()) {
                path.remove();
            } else {
            //var a = console.log()
                path.replaceWith(createVoid0());
            }
            } else if (isIncludedConsoleBind(callee, state.opts.exclude)) {
            // console.log.bind()
                path.replaceWith(createNoop());
            }
        },
        MemberExpression: {
            exit(path, state) {
            if (
                isIncludedConsole(path, state.opts.exclude) &&
                !path.parentPath.isMemberExpression()
            ) {
            //console.log = func
                if (
                path.parentPath.isAssignmentExpression() &&
                path.parentKey === "left"
                ) {
                path.parentPath.get("right").replaceWith(createNoop());
                } else {
                //var a = console.log
                path.replaceWith(createNoop());
                }
            }
            }
        }
        }
    };

    ```

    - 用gogoAST实现：

    ```javascript
    const AST = GG.createAstObj(code);
    AST.replaceSelBySel(`var $_$ = console.log()`, `$_$ = void 0`);
    AST.replaceSelBySel(`console.log()`, null);
    AST.replaceSelBySel(`var $_$ = console.log`, `$_$ = function(){}`);
    const result = AST.generate();
    ```


- 示例2: 与jscodeshift对比

    对于下面这段代码：
    
    ```javascript
    import car from 'car';

    const suv = car.factory('white', 'Kia', 'Sorento', 2010, 50000, null, true);
    const truck = car.factory('silver', 'Toyota', 'Tacoma', 2006, 100000, true, true);
    ```
    
    假如我们希望将函数的多个入参封装为一个对象传入，变成下面这样

    ```javascript
    import car from 'car';
    const suv = car.factory({"color":"white","make":"Kia","model":"Sorento","year":2010,"miles":50000,"bedliner":null,"alarm":true});
    const truck = car.factory({"color":"silver","make":"Toyota","model":"Tacoma","year":2006,"miles":100000,"bedliner":true,"alarm":true});
    ```

    - 用jscodeshift实现的核心代码：

    ``` javascript
    // 代码来源：https://www.toptal.com/javascript/write-code-to-rewrite-your-code
    export default (fileInfo, api) => {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // find declaration for "car" import
    const importDeclaration = root.find(j.ImportDeclaration, {
        source: {
        type: 'Literal',
        value: 'car',
        },
    });

    // get the local name for the imported module
    const localName =
        importDeclaration.find(j.Identifier)
        .get(0)
        .node.name;

    // current order of arguments
    const argKeys = [
        'color',
        'make',
        'model',
        'year',
        'miles',
        'bedliner',
        'alarm',
    ];

    // find where `.factory` is being called
    return root.find(j.CallExpression, {
        callee: {
            type: 'MemberExpression',
            object: {
            name: localName,
            },
            property: {
            name: 'factory',
            },
        }
        })
        .replaceWith(nodePath => {
        const { node } = nodePath;

        // use a builder to create the ObjectExpression
        const argumentsAsObject = j.objectExpression(

            // map the arguments to an Array of Property Nodes
            node.arguments.map((arg, i) =>
            j.property(
                'init',
                j.identifier(argKeys[i]),
                j.literal(arg.value)
            )
            )
        );

        // replace the arguments with our new ObjectExpression
        node.arguments = [argumentsAsObject];

        return node;
        })

        // specify print options for recast
        .toSource({ quote: 'single', trailingComma: true });
    };
    ```

    - 用gogoAST实现：

    ``` javascript
    const AST = GG.createAstObj(code);
    const argKeys = ['color', 'make', 'model', 'year', 'miles', 'bedliner', 'alarm' ];
    const { nodePathList, matchWildCardList } = AST.getAstsBySelector(`const $_$ = car.factory($_$)`, 'nn', false);
    nodePathList.forEach((path, i) => {
        const extra = matchWildCardList[i];
        const variableName = extra.shift().value;
        const obj = {};
        extra.forEach((ext, ei) => {
            obj[argKeys[ei]] = ext.structure.value
        });
        const newCall = GG.buildAstByAstStr(`${variableName} = car.factory(${JSON.stringify(obj)})`)
        AST.replaceAstByAst(path, newCall);
    })
    const result = AST.generate();
    ```

# API
陆续补充中

1. 创建一个实例：createAstObj

    ```javascript
    const GG = require('gogoast');
    const AST = GG.createAstObj(p, options);    
    // options非必传，格式同babel-parse,如 { allowImportExportEverywhere: true, plugins: ['jsx'] }
    ```
    
2. 通过选择器查找AST节点：getAstsBySelector
    - 选择器是一段包含通配符（$_$）的代码
    - nodePathList：返回找到的ast节点路径，包含自己节点、父节点等信息
    - matchWildCardList：返回通配符$_$代表的节点信息，其中structure是节点完整信息，value是简略信息

    ```javascript
    const { nodePathList, matchWildCardList } = AST.getAstsBySelector([
        '$_$.setTip($_$, $_$)',
        'tip.show($_$)'
    ]);

    ```

3. 通过选择器替换另一个选择器查找到的AST节点：replaceSelBySel
    - 就像'abcd'.replace('a', 'z')一样好用

    ```javascript
    AST.replaceSelBySel('const $_$ = require($_$)', 'import $_$ from $_$');
    AST.replaceSelBySel('$.extend(true, $_$, $_$)', 'Object.assign($_$, $_$)');
    AST.replaceSelBySel('$.each($_$, function($_$, $_$) { $_$ } )', '$_$.forEach($_$, $_$)');
    ```

4. 创建一个AST节点：buildAstByAstStr
    - 可以通过字符串拼接AST节点的方式构造新的AST节点

    ```javascript
    const type = 'error';
    const content = ASTNODE; // 从其他代码中提取出来或者自己构造的ast节点
    GG.buildAstByAstStr(`
        Alert.show({
            type: '${type}',
            content: '$_$content$_$'
        })
    `, {
        content
    })
    ```

5. GG模块其他基本方法
    - 将AST节点转成字符串 generate(ast)
    - 获取AST节点的所有父节点 getParentListByAst(path)
    - 判断一个AST节点是否包含某子节点，子节点用选择器表示 hasChildrenSelector(path, childSelector)
    - 用一个AST节点替换某个字符串 replaceStrByAst
    - replaceAstByAst
    - getPrevAst
    - getNextAst
    - insertAstListBefore
    - insertAstListAfter
    - removeAst
    - ......
    - AST实例上也有部分方法，用法相比GG模块调用少传第一个参数，实际传入的是该实例自身的ast结构

6. 特殊类型AST节点的构造方法
    - buildObjectProperty

    ```javascript
    // 为什么不直接用buildAstByAstStr？把一个对象粘贴进astexplore就知道了
    AST.buildObjectProperty({
        url: 'getList',
        type: 'get'
    })
    ```

    - appendJsxAttr
    ```javascript
    const locaid = '98s8dh3';
    const params = [ 'a=${aa}', 'b=${{aaa:"222",xxx:{ssss:111}}}', 'c=${"s"}', 'd=${a+1}','e=${ ss?2:1}' ]

    AST.appendJsxAttr({
       'attr1: `{${'`'}gostr='$'{gostr};locaid=d${locaid};${params.join('&')}}${'`'}}`, // 模板字符串
        a: `{a+1}`, // 表达式
        b: `'a'`, // 字符串
        c: `{a}` // 变量
    });

    // 结果：
    <div attr1={`gostr=${gostr};locaid=d98s8dh3;a=${aa}&b=${{aaa:"222",xxx{ssss:111}}}&c=${"s"}&d=${a+1}&e=${ ss?2:1}}`}a={a+1} b='a' c={a}>
    </div>
    ```
