module.exports = {
    go: {
        match: 'attr',
        key: 'onClick',
        handle (node, { attrs, attrMap, parentRef, posIndex, filePath }) {
            attrMap['onClick'].value.content = 'trans'
        }
    }
}