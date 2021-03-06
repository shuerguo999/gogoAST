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
    'static',
    'typeParameters'
]
function isObject(value) {
    return typeof value === 'object' && value;
}

const filterProps = function (node, structure) {
    for (const key in node) {
        // 过滤值为空的字段
        if (Props.indexOf(key) == -1 && node[key]) {
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