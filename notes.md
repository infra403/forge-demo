关于electron打包temporal,之前老外给我的回复
```text
Thankfully, fixing this is not that difficult, though the proper solution depends on what you really wanna do. I’ll assume that your workflows are not meant to be modified after the application is packages (ie. your electron app gets packages with very specific workflows; modifying workflows require bundling and releasing a new version of your application). Ask for more details if that assumption is wrong.
In that case, you will need to make these four essential changes:

Prepare your workflow bundle BEFORE you package your Electron App. This is similar to what you have tried previously, but this must be done as a distinct build step (something like npm run bundle-workflows, or maybe as distinct task from your electron forge config, though I can’t help you with that). The important thing is that you must not be calling bundleWorkflow from your application’s code. See this example for how this can be done.
In your worker.ts file, you will need to specify your workflow bundle path (ie. workflow-bundle.js) rather than the path of your workflows.ts file. You may want to do that conditionally, eg. based on the presence of an environment variable, so that you don’t need to prebundle your workflows while developing locally. See here for an example of this.
In your electron bundler’s webpack config, you will need to exclude inclusion of the webpack package. I believe you should be able to do so by adding the following config to your webpack.main.config.ts file:
      resolve: {
        alias: {
          webpack: false,
        },
      },
4. You will need to ensure that your electron builder consider all @temporalio/* packages as externals dependencies. I don’t know exactly how this is done in electron forge, you will need to do some search for this. Just make sure you don’t get fooled by a webpack-only solution (eg. adding something like externals: { ... } in your webpack.main.config.ts, without anything else, as these packages must be included in your final application bundle.
```

在使用electron forge中，使用 https://www.npmjs.com/package/@timfish/forge-externals-plugin 打包，下面是配置
```text
    new ForgeExternalsPlugin({
      "externals": [
        "@temporalio/activity",
        "@temporalio/client",
        "@temporalio/common",
        "@temporalio/core-bridge",
        "@temporalio/proto",
        "@temporalio/worker",
        "@temporalio/workflow"
      ],
      "includeDeps": true
    }),
```
在webpack.config里面加入了下面的配置
```text
  externals: [
    "@temporalio/activity",
    "@temporalio/client",
    "@temporalio/common",
    "@temporalio/core-bridge",
    "@temporalio/proto",
    "@temporalio/worker",
    "@temporalio/workflow"
  ]
```
部署到生产环境时，需要先进行打包，worker引入的时候，需要引入打包后的文件，而不是源文件: https://github.com/infra403/electron-vite-demo/blob/main/src/worker/worker.ts#L11
我现在是通过 npm run build:workflow 打包放到data目录下，然后将data目录打包到electron程序中，再通过相对路径引入。

## 复现步骤
```text
1.npm run make
2.点击获取gas
```
下面是输出的错误日志
```text
result: error: Error: failed to meet quorum (method="getBlockNumber", params={}, results=[{"weight":1,"start":1695092459941,"error":{"reason":"missing response","code":"SERVER_ERROR","requestBody":"{\"method\":\"eth_blockNumber\",\"params\":[],\"id\":42,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","serverError":{},"url":"https://rpc.ankr.com/eth/9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972"}},{"weight":1,"start":1695092459941,"error":{"reason":"missing response","code":"SERVER_ERROR","requestBody":"{\"method\":\"eth_blockNumber\",\"params\":[],\"id\":42,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","serverError":{},"url":"https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"}},{"weight":1,"start":1695092461941,"error":{"reason":"missing response","code":"SERVER_ERROR","requestBody":null,"requestMethod":"GET","serverError":{},"url":"https://api.etherscan.io/api?module=proxy&action=eth_blockNumber"}},{"weight":1,"start":1695092461941,"error":{"reason":"missing response","code":"SERVER_ERROR","requestBody":"{\"method\":\"eth_blockNumber\",\"params\":[],\"id\":42,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","serverError":{},"url":"https://eth-mainnet.gateway.pokt.network/v1/lb/62e1ad51b37b8e00394bda3b"}},{"weight":1,"start":1695092463941,"error":{"reason":"missing response","code":"SERVER_ERROR","requestBody":"{\"method\":\"eth_getBlockByNumber\",\"params\":[\"latest\",false],\"id\":42,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","serverError":{},"url":"https://cloudflare-eth.com/"}},{"weight":1,"start":1695092463941,"error":{"reason":"missing response","code":"SERVER_ERROR","requestBody":"{\"method\":\"eth_blockNumber\",\"params\":[],\"id\":42,\"jsonrpc\":\"2.0\"}","requestMethod":"POST","serverError":{},"url":"https://mainnet.infura.io/v3/84842078b09946638c03157f83405213"}}], provider={"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"providerConfigs":[{"provider":{"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"connection":{"allowGzip":true,"url":"https://mainnet.infura.io/v3/84842078b09946638c03157f83405213"},"_nextId":43,"apiKey":"84842078b09946638c03157f83405213","projectId":"84842078b09946638c03157f83405213","projectSecret":null,"_eventLoopCache":{"eth_blockNumber":{}},"_internalBlockNumber":null},"weight":1,"stallTimeout":2000,"priority":1},{"provider":{"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"baseUrl":"https://api.etherscan.io","apiKey":null,"_internalBlockNumber":null},"weight":1,"stallTimeout":2000,"priority":1},{"provider":{"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"connection":{"allowGzip":true,"url":"https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"},"_nextId":43,"apiKey":"_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC","_eventLoopCache":{"eth_blockNumber":{}},"_internalBlockNumber":null},"weight":1,"stallTimeout":2000,"priority":1},{"provider":{"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"connection":{"headers":{},"url":"https://eth-mainnet.gateway.pokt.network/v1/lb/62e1ad51b37b8e00394bda3b"},"_nextId":43,"applicationId":"62e1ad51b37b8e00394bda3b","loadBalancer":true,"applicationSecretKey":null,"_eventLoopCache":{"eth_blockNumber":{}},"_internalBlockNumber":null},"weight":1,"stallTimeout":2000,"priority":1},{"provider":{"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"connection":{"url":"https://cloudflare-eth.com/"},"_nextId":43,"_internalBlockNumber":null},"weight":1,"stallTimeout":750,"priority":1},{"provider":{"_isProvider":true,"_events":[],"_emitted":{"block":-2},"disableCcipRead":false,"formatter":{"formats":{"transaction":{},"transactionRequest":{},"receiptLog":{},"receipt":{},"block":{},"blockWithTransactions":{},"filter":{},"filterLog":{}}},"anyNetwork":false,"_network":{"name":"homestead","chainId":1,"ensAddress":"0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"},"_maxInternalBlockNumber":-1024,"_lastBlockNumber":-2,"_maxFilterBlockRange":10,"_pollingInterval":4000,"_fastQueryDate":0,"connection":{"allowGzip":true,"url":"https://rpc.ankr.com/eth/9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972"},"_nextId":43,"apiKey":"9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972","_eventLoopCache":{"eth_blockNumber":{}},"_internalBlockNumber":null},"weight":1,"stallTimeout":2000,"priority":1}],"quorum":2,"_highestBlockNumber":-1,"_internalBlockNumber":{}}, code=SERVER_ERROR, version=providers/5.7.2)
```
错误位置: index.ts
```js
ipcMain.on('start-worker',  (event, args) => {
    fs.writeFileSync('/tmp/test.txt', `start worker: ${args}\n`)
    console.log("main", event, args)
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    event.sender.send('send-content', '开始获取GasPrice');
    try {
        getPrice().then( (result) => {
            fs.appendFileSync('/tmp/test.txt', `result: ${result}\n`)
        })

    }catch (e) {
        console.log("main get price", e)
        fs.appendFileSync('/tmp/test.txt', `error: ${e}\n`)
    }
    run()
});
```
