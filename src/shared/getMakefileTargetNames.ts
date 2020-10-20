import path from 'path';

import exec from './exec';
import exists from './exists';
import getOutputChannel from './getOutputChannel';
import showError from './showError';

// TODO maybe for better cross-OS, move to read-file instead of depending on make executable
const CMD = `make --no-builtin-rules --no-builtin-variables --print-data-base --just-print`;

export const MAKEFILE = 'Makefile';

function getResultLines(result: string): string[] {
  const startAt = result.lastIndexOf('# Files');
  const lines = result.substr(startAt).split(/\r{0,1}\n/g);
  const validLineRegex = /^(?!(Makefile|#|\.|\s)).+?:$/;
  const validLines = lines
    .filter(line => validLineRegex.test(line))
    .map(line => line.replace(':', ''));
  return validLines;
}

export default async function getMakefileTargetNames(rootPath?: string): Promise<string[] | null> {
  if (!rootPath) {
    return null;
  }

  const makeFileExists = await exists(path.join(rootPath, MAKEFILE));

  if (!makeFileExists) {
    return null;
  }

  const { stdout, stderr } = await exec(CMD, { cwd: rootPath });

  if (stderr) {
    getOutputChannel().appendLine(stderr);
    showError();
  }

  const targetNames = getResultLines(stdout);
  return targetNames;
}
