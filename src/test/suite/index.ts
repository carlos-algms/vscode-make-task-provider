import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import glob from 'glob';
import Mocha from 'mocha';
import path from 'path';

import 'chai/register-expect';
import 'chai/register-should';
import 'chai/register-assert';

export function run(): Promise<void> {
  chai.use(chaiAsPromised);

  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    reporter: 'list',
  });

  const testsRoot = path.resolve(__dirname, '../..');

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      // Add files to the test suite
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });
}
