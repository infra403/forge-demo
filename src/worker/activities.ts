import {ethers} from "ethers";
import {getProvider} from "./plugins/eth";


export const helloWorld = async (name: string): Promise<string> => {
  return `Hello ${name}!`;
}

export const getGasPrice = async ():Promise<string> => {
  const provider = getProvider("")
  const gas = await provider.getGasPrice()
  return gas.toString()
}
