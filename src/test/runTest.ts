import { runTests } from '@vscode/test-electron';
import path from 'path';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    const [, , workspace] = process.argv;

    // Download VS Code, unzip it and run the integration test
    await runTests({
      version: 'insiders',
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspace],
    });
  } catch (err) {
    console.error('Failed to run tests', (<Error>err).message);
    process.exit(1);
  }
}

main();
