# GOGOAST

## 为什么你需要用GOGOAST？
- 全网最快最简单的解决办法！
- 如果你需要对代码升级、改造、分析，只要是任何可以通过AST进行的处理，你都可以用GOGOCODE快速解决问题。
- 不需要再traverse，一层一层的对比操作ast节点，甚至不需要理解什么是CallExpression，什么是Identifier

## 基于：
- recast，我不想让代码格式有太多变化，
- babel-parse，紧跟最新规范，支持各种语法
- hyntax，小而精致

## API
陆续补充

1. 创建一个实例：createAstObj

    ```javascript
    const GG = require('gogocode');
    const G = GG.createAstObj(p, options);    
    // options非必传，格式同babel-parse,如 { allowImportExportEverywhere: true, plugins: ['jsx'] }
    ```
2. 通过选择器查找AST节点：getAstsBySelector
    - 选择器其实就是一段包含通配符（$_$）的代码
    - pathList：返回找到的ast节点路径，包含自己节点、父节点等信息
    - extraDataList：返回通配符$_$代表的节点信息，其中structure是节点完整信息，value是简略信息

    ```javascript
    const { pathList, extraDataList } = G.getAstsBySelector([
        '$_$.setTip($_$, $_$)',
        'tip.show($_$)'
    ]);

    ```

3. 通过选择器替换另一个选择器查找到的AST节点：replaceSelBySel
    - 就像'abcd'.replace('a', 'b')一样好用

    ```javascript
    G.replaceSelBySel('const $_$ = require($_$)', 'import $_$ from $_$');
    G.replaceSelBySel('$.extend(true, $_$, $_$)', 'Object.assign($_$, $_$)');
    G.replaceSelBySel('$.each($_$, function($_$, $_$) { $_$ } )', '$_$.forEach($_$, $_$)');
    ```

4. 创建一个AST节点：buildAstByAstStr
    - 可以通过字符串拼接AST节点的方式构造新的AST节点

    ```javascript
    const type = 'error';
    const content = ASTNODE; // 从其他代码中提取出来或者自己构造的ast节点
    G.buildAstByAstStr(`
        Alert.show({
            type: '${type}',
            content: '$_$content$_$'
        })
    `, {
        content
    })
    ```

5. G对象上的其他基本方法
    - 将AST节点转成字符串 generate()
    - 获取AST节点的所有父节点 getParentListByAst()
    - 判断一个AST节点是否包含某子节点，子节点用选择器表示 hasChildrenSelector(path, childSelector)
    - 用一个AST节点替换某个字符串 replaceStrByAst
    - replaceAstByAst
    - getPrevAst
    - getNextAst
    - insertAstListBefore
    - insertAstListAfter
    - removeAst
    - ......

6. 特殊类型AST节点的构造方法
    - buildObjectProperty

    ```javascript
    // 为什么不直接用buildAstByAstStr？把一个对象粘贴进astexplore就知道了
    G.buildObjectProperty({
        url: 'getList',
        type: 'get'
    })
    ```

    - appendJsxAttr
    ```javascript
    const param1 = '98s8dh3';
    const params = [ 'a=${aa}', 'b=${{aaa:"222",xxx:{ssss:111}}}', 'c=${"s"}', 'd=${a+1}','e=${ ss?2:1}' ]

    G.appendJsxAttr({
       'attr1: `{${'`'}param1='$'{param1};param2=d${param2};${params.join('&')}}${'`'}}`, // 模板字符串
        a: `{a+1}`, // 表达式
        b: `'a'`, // 字符串
        c: `{a}` // 变量
    });

    // 结果：
    <div attr1={`gostr=${gostr};param2=d98s8dh3;a=${aa}&b=${{aaa:"222",xxx{ssss:111}}}&c=${"s"}&d=${a+1}&e=${ ss?2:1}}`}a={a+1} b='a' c={a}>
    </div>
    ```