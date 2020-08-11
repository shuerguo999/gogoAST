module.exports = {
    go: {
        match: 'attr',
        key: 'onClick',
        handle (node, attrs, attrMap, parentRef) {
            attrMap['onClick'].value.content = 'trans'
        }
    }
}