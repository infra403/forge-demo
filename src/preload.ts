// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {ethers} from "ethers";

const {contextBridge, ipcRenderer} = require('electron')

// Custom APIs for renderer
window.addEventListener("DOMContentLoaded", async () => {
    const provider = ethers.getDefaultProvider("mainnet")
    const gas = await provider.getGasPrice()
    console.log(`preload gas: ${gas.toString()}`)
});