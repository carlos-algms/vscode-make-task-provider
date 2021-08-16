import { runCLI } from 'jest';
import path from 'path';

export async function run(
  _testsRoot: string,
  reportTestResults: (error: Error, failures?: number) => void,
): Promise<void> {
  const projectRootPath = process.env.PROJECT_FOLDER;
  const configPath = path.join(projectRootPath, 'jest.config.js');

  try {
    const jestCliCallResult = await runCLI({ config: configPath } as any, [projectRootPath]);

    jestCliCallResult.results.testResults.forEach((testResult) => {
      testResult.testResults
        .filter((assertionResult) => assertionResult.status === 'passed')
        .forEach(({ ancestorTitles, title, status }) => {
          console.info(`  ● ${ancestorTitles.join(' › ')} › ${title} (${status})`);
        });
    });

    jestCliCallResult.results.testResults.forEach((testResult) => {
      if (testResult.failureMessage) {
        console.error(testResult.failureMessage);
      }
    });

    reportTestResults(undefined, jestCliCallResult.results.numFailedTests);
  } catch (error) {
    reportTestResults(error, 0);
  }
}
