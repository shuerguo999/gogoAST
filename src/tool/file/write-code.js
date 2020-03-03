// 写入code
const fs = require('fs');
const writeCode = function(code, filename = 'src/code/output.js') {
    fs.writeFile(`${filename}`, code, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`write code to ${filename} success!!!`);
        }
    });
}

module.exports = writeCode;