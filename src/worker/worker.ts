

import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import {getGasPrice} from "./activities";

// @@@SNIPSTART typescript-production-worker
const workflowOption = () =>
  process.env.NODE_ENV === 'production'
    ? {
      workflowBundle: {
        codePath: require.resolve('../data/workflow-bundle.bs'),
      },
    }
    : { workflowsPath: require.resolve('./workflows') };

export function run() {
   Worker.create({
    ...workflowOption(),
    activities,
    taskQueue: 'production-sample',
  }).then(worker => worker.run());
}

export async function getPriceWorkflow() {
    const price = await getGasPrice()
    console.log(`Gas price is ${price}`)
}
// @@@SNIPEND
