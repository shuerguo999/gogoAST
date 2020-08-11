module.exports = (ast, transformMap = {}, file) => {
    if (ast.content && ast.content.children && ast.content.children.length > 0) {
        ast.content.children.forEach((node, index) => {
            node._index = index;
            handleNode(node)
        });
    }
    if (Array.isArray(ast)) {
        ast.forEach(a => { 
            handleNode(a)
        });
    }
    function handleNode(node) {
        if (node.nodeType == 'tag') {  // 标签处理
            const tagHandle = transformMap.tag || [];
            tagHandle.forEach(h => {
                if (h.value) {
                    if (h.value == node.content.name) {
                        h.handle(node.content);    
                    }
                } else {
                    h.handle(node.content);
                }
            });

            const attrHandle = transformMap.attr || [];
            const attrs = node.content.attributes || [];
            const attrMap = {};
            
            attrs.forEach(attr => {
                // 处理属性值的引号
                // let content = attr.value.content.trim();
                // if (content[0] == content[content.length - 1]) {
                //     if (content.match(content[0]))
                // }
                attrMap[attr.key.content] = attr;
            });
            attrHandle.forEach(h => {
                const { key, value } = h;
                if (value) { // 某个属性有确定的key和value)
                    if (attrMap[key] && attrMap[key].value && (attrMap[key].value.content.replace(/\s/g, '') == value)) {
                        h.handle(node.content, attrs, attrMap, node.parentRef, file);
                    }
                } else {
                    if (attrMap[key]) { // 只要有某个属性
                        h.handle(node.content, attrs, attrMap, node.parentRef, file);
                    }
                }
                
            });

            const eventHandle = transformMap.event || [];
            const attrKeys = Object.keys(attrMap);
            const eventAttr = attrKeys.filter(k => k.match('mx-'))[0];
            if (eventAttr) {
                eventHandle.forEach(h => {
                    h.handle(node.content, attrMap[eventAttr]);
                });
            }

            if (transformMap.abandonAttr) {
                for (let i = 0; i< attrs.length; i++) {
                    const attr = attrs[i];
                    if (attr && transformMap.abandonAttr.indexOf(attr.key.content) > -1) {
                        attrs.splice(i, 1);
                        i--;
                    }
                }
            }
        }
        if (node.nodeType == 'text') { // 字符串处理
            const handle = transformMap.text || [];
            handle.forEach(h => {
                let isContain = false;
                switch (h.type) {
                    case 'containOne':
                        isContain = h.value.some(v => node.content.value.content.match(v))
                        if (isContain) {
                            h.handle(node, file, node.parentRef);
                        }
                        break;
                    case 'containAll':
                        isContain = h.value.every(v => node.content.value.content.match(v))
                        if (isContain) {
                            h.handle(node, file, node.parentRef);
                        }
                        break;
                    case 'equal': 
                        if (node.content.value.content == h.value) {
                            h.handle(node);
                        }
                        break;
                    default:
                        h.handle(node)
                }
            });
        }

        if (node.content.children && node.content.children.length) {
            node.content.children.forEach(n => {
                handleNode(n)
            });
        }
    }
    return ast;
}