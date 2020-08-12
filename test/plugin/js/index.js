const G = require('gogoast');
G.runJsPlugin({
    pluginDir: 'test/plugin/js',
    codeList: [`Component({
        onInit() {
            const data = calculateData(this.props);
            console.log('picture calculateData', data);
            this.data = calculateData(this.props);
            const abc = calculateData(this.props);
            // const abc = Object.assign(calculateData(this.props), {x: 1})
            this.data = abc;
            this.data = {
                x:1
            };
        }
    })`]
}).then(res => {
    console.log(res)
})