const G = require('gogoast');
G.runHtmlPlugin({
    pluginDir: 'test/plugin/html',
    codeList: [`<view class="picture" style="{{style}}" onTap="navigateTo">
    <!-- <image a:if="{{lazyBG}}" class="picture-lazy" src="{{lazyBG}}" lazy-load="{{true}}"></image> -->
    <block a:if="{{srcs && srcs.length > 0}}"><image class="picture-image" a:for="{{srcs}}" key="{{index}}" style="{{item.pStyle}}" src="{{item.src}}" lazy-load="{{lazyload}}"></image></block>
    <block a:else><image class="picture-image" src="{{src}}" lazy-load="{{lazyload}}"></image></block>
  </view><!-- <image -->
  `],
    deleteComment: true,
    outputFile: false
}).then(res => {
    console.log(res)
})