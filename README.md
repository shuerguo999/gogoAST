# GOGOAST
别名GOGOCODE

npm包：[https://www.npmjs.com/package/gogocode](https://www.npmjs.com/package/gogocode)

github：[https://github.com/shuerguo999/gogoAST](https://github.com/shuerguo999/gogoAST)

## 为什么你需要用GOGOCODE？
- 全网最简单易上手，可读性最强的AST处理工具！
- 如果你需要对代码升级、改造、分析，任何可以通过AST进行的处理，都可以用GOGOCODE快速解决问题。
- 不需要traverse，像剥洋葱一样一层一层的对比操作、构造ast节点，甚至不需要理解什么是CallExpression、Identifier、ImportDeclaration

## 基于：
- recast，我不想让代码格式有太多变化
- babel-parse，紧跟最新规范，支持各种语法
- hyntax，小而精致

## 对比Babel插件 jscodeshift工具的使用：
- 例1: 处理程序中的console.log

    ```javascript
    // input
    import a from 'a';
    console.log('get A')
    var b = console.log()
    console.log.bind()
    var c = console.log
    console.log = func

    // output
    import a from 'a';
    var b = void 0;
    console.log.bind()
    var c = function(){};
    console.log = func
    ```

    - Babel插件的核心代码：

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

    - 使用gogocode：

    ```javascript
    const AST = GG.createAstObj(code);
    AST.replaceSelBySel(`var $_$ = console.log()`, `$_$ = void 0`);
    AST.replaceSelBySel(`console.log()`, null);
    AST.replaceSelBySel(`var $_$ = console.log`, `$_$ = function(){}`);
    const result = AST.generate();
    ```


- 例2: 用对象类型的入参替换独立入参

    ```javascript
    // input
    import car from 'car';

    const suv = car.factory('white', 'Kia', 'Sorento', 2010, 50000, null, true);
    const truck = car.factory('silver', 'Toyota', 'Tacoma', 2006, 100000, true, true);

    // output
    import car from 'car';
    const suv = car.factory({"color":"white","make":"Kia","model":"Sorento","year":2010,"miles":50000,"bedliner":null,"alarm":true});
    const truck = car.factory({"color":"silver","make":"Toyota","model":"Tacoma","year":2006,"miles":100000,"bedliner":true,"alarm":true});
    ```

    - 使用jscodeshift处理的核心代码：

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

    - 使用gogocode：

    ``` javascript
    const AST = GG.createAstObj(code);
    const argKeys = ['color', 'make', 'model', 'year', 'miles', 'bedliner', 'alarm' ];
    const { pathList, extraDataList } = AST.getAstsBySelector(`const $_$ = car.factory($_$)`, 'nn', false);
    pathList.forEach((path, i) => {
        const extra = extraDataList[i];
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

## API
陆续补充

1. 创建一个实例：createAstObj

    ```javascript
    const GG = require('gogocode');
    const AST = GG.createAstObj(p, options);    
    // options非必传，格式同babel-parse,如 { allowImportExportEverywhere: true, plugins: ['jsx'] }
    ```
2. 通过选择器查找AST节点：getAstsBySelector
    - 选择器其实就是一段包含通配符（$_$）的代码
    - pathList：返回找到的ast节点路径，包含自己节点、父节点等信息
    - extraDataList：返回通配符$_$代表的节点信息，其中structure是节点完整信息，value是简略信息

    ```javascript
    const { pathList, extraDataList } = AST.getAstsBySelector([
        '$_$.setTip($_$, $_$)',
        'tip.show($_$)'
    ]);

    ```

3. 通过选择器替换另一个选择器查找到的AST节点：replaceSelBySel
    - 就像'abcd'.replace('a', 'b')一样好用

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
    AST.buildAstByAstStr(`
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
    - AST实例上也有部分方法，用法比GG模块调用少传第一个参数

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