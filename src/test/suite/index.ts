import chai, { assert, expect, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { globSync } from 'glob';
import Mocha from 'mocha';
import path from 'path';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

/**
 * This function can't be async
 * It would only work by returning a new Promise.
 * Maybe because VSCode polyfills somehow the global Promise, while async returns the native one 🤷🏼‍♂️
 * https://github.com/microsoft/vscode-test/blob/addc23e100b744de598220adbbf0761da870eda9/sample/src/test/suite/index.ts#L5
 */
export function run(_testRoot: string, done: (error: Error | null, failures?: number) => void) {
  globalThis.expect = expect;
  globalThis.assert = assert;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.should = should();

  chai.use(chaiAsPromised);
  chai.use(sinonChai);

  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    reporter: 'list',
    rootHooks: {
      afterEach() {
        sinon.restore();
      },
    },
  });

  const testsRoot = path.resolve(__dirname, '../..');

  try {
    const files = globSync('**/**.test.js', { cwd: testsRoot });

    files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

    mocha.run((failures) => {
      done(null, failures);
    });
  } catch (error) {
    console.error(error);
    done(error);
  }
}
