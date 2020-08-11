const fs = require('fs');
const code = function(filename = 'src/code/input.js') {
    try {
        return fs.readFileSync(filename);
    } catch(e) {
        return ''
    }
}
module.exports = code;