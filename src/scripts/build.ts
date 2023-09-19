// @@@SNIPSTART typescript-bundle-workflow
import { bundleWorkflowCode } from '@temporalio/worker';
import { writeFile } from 'fs/promises';
import path from 'path';

async function bundle() {
    const { code } = await bundleWorkflowCode({
        workflowsPath: require.resolve('../worker/workflows'),
    });

    // const content = Buffer.from(code, 'utf8').toString('base64');
    const codePath = path.join(__dirname, '../../src/data/workflow-bundle.bs');

    await writeFile(codePath, code);
    console.log(`Bundle written to ${codePath}`);
}
// @@@SNIPEND

bundle().catch((err) => {
    console.error(err);
    process.exit(1);
});