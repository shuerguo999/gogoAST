// 写入code
const fs = require('fs');
const writeCode = function(code, filename = 'src/code/output.js') {
    try {
        fs.writeFileSync(filename, code);
        console.log(`write code to ${filename} success!!!`);
    } catch(e) {
        console.error(e);
    }
}

module.exports = writeCode;