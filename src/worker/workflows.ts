import {proxyActivities} from "@temporalio/workflow";
import type * as activities from './activities'
const {
  helloWorld,
  getGasPrice
} = proxyActivities<typeof activities>({
  retry: {
    initialInterval: '50 milliseconds',
    maximumAttempts: 5,
  },

  startToCloseTimeout: '1209600 seconds', // 7*24 minutes
})

export const gasPriceWorkflow = async (name: string): Promise<string> => {
  const result = await getGasPrice();
  return result;
}
