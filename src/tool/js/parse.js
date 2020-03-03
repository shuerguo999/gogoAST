const recast = require('recast');
const babelParse = require('@babel/parser');
module.exports = function(code) {
    const globalOptions = global.parseOptions;
    let plugins = ((globalOptions && globalOptions.plugins) ? globalOptions.plugins : [])
        .concat([
        'plugin-syntax-typescript',
        'typescript',
        'asyncGenerators',
        'bigInt',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'doExpressions',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'functionBind',
        'functionSent',
        'importMeta',
        'logicalAssignment',
        'nullishCoalescingOperator',
        'numericSeparator',
        'objectRestSpread',
        'optionalCatchBinding',
        'optionalChaining',
        'partialApplication',
        ['pipelineOperator', {'proposal': "smart"}],
        'throwExpressions',
        'topLevelAwait' 
    ]);
    const parseOptions = {
        // sourceType: 'module',
        allowHashBang: true,
        ecmaVersion: Infinity,
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        startLine: 1,
        tokens: true,
        ...(globalOptions || {}),
        plugins,
    };
    return recast.parse(code, {
        parser: {
            parse(code) {
                return babelParse.parse(code, parseOptions);
            }
        }
    });
}