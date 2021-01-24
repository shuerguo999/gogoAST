const $ = require('../main');
const replacer = $(`function a (am, x, b, {s = 1}) {} var a = 1;
var d = { c: 1, s: 2, m: { c : 'c'}}`)
.find('b')
const ast = $(`function a (am, x, bm, {s = 1}) {} var a = 1;
var d = { c: 1, s: 2, m: { c : 'c'}}
`, {parseOptions: { plugins: ['jsx']}})
// .find('x')
// .has('a')
// .each((item, i) => {
    // return item.find('a');
// })
// .replace('a', replacer)
// .replace('a', 'b')
// .find('a')
// .replaceBy(replacer)
// .eq(1)
// .parent()
// .parents()
// .siblings()
// .nextAll()
// .empty()
// .clone()
// .find('bm').before(replacer)
.find('function $_$() {}')
.append('var bbbb = 1')
.root()
.generate()
var a = 1
