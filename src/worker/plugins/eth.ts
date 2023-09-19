import {ethers} from "ethers";

export const getProvider = (url: string)=> {
  const provider = ethers.getDefaultProvider()
  return provider
}
