// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {ethers} from "ethers";

const {contextBridge, ipcRenderer} = require('electron')

const getPrice = () => {
    const provider = ethers.getDefaultProvider("mainnet")
    return provider.getGasPrice().then((price) => {
        console.log("preload gas price", price.toString())
        return price.toString()
    }).catch((err) => {
        console.log("error")
        return `error: ${err}`
    })
}

// Custom APIs for renderer
window.addEventListener("DOMContentLoaded", async () => {
    getPrice().then((price) => {
        console.log("price", price)
    })

    const importButton = document.getElementById("getPrice");
    importButton.addEventListener("click", () => {
        console.log("start getPrice")
        ipcRenderer.send('start-worker')
    })
});