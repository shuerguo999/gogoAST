// 查找时 ast无用属性
const Props = [
    'computed',
    'range',
    'loc',
    'type',
    'raw',
    'start',
    'end',
    'leadingComments',
    'shorthand',
    'extra',
    'static'
]
function isObject(value) {
    return typeof value === 'object' && value;
}

const filterProps = function (node, structure) {
    for (const key in node) {
        if (Props.indexOf(key) == -1) {
            if (isObject(node[key])) {
                if (Array.isArray(node[key])) {
                    structure[key] = [];
                    node[key].forEach((n, i) => {
                        structure[key][i] = {};
                        filterProps(n, structure[key][i]);
                    });
                } else {
                    structure[key] = {};
                    filterProps(node[key], structure[key]);
                }
            } else {
                structure[key] = node[key];
            }   
        }
    }
}

module.exports = filterProps;