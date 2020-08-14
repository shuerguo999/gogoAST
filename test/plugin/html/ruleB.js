module.exports = {
    go: {
        match: 'attr',
        key: 'a:if',
        handle (node, {attrs, attrMap, parentRef, posIndex, filePath}) {
          const str = attrMap['a:if'].value.content;
          const newStr = `${str.slice(0, 2)}#if ${str.slice(2)}`;
          parentRef.content.children.splice(3, 0, {
            nodeType: 'text',
            content: {
              value: {
                content: newStr
              }
            }
          });
        }
    }
  };