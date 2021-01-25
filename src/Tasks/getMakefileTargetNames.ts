import path from 'path';
import vscode from 'vscode';

import { MAKE_BIN } from '../shared/constants';
import exec from '../shared/exec';
import exists from '../shared/exists';
import getOutputChannel from '../shared/getOutputChannel';
import showError from '../shared/showError';
import { trackException } from '../telemetry/tracking';

// TODO maybe for better cross-OS, move to read-file instead of depending on make executable
const CMD = `${MAKE_BIN} --no-builtin-rules --no-builtin-variables --print-data-base --just-print`;

function getResultLines(result: string): string[] {
  const startAt = result.lastIndexOf('# Files');
  const lines = result.substr(startAt).split(/\r{0,1}\n/g);
  const validLineRegex = /^(?!(Makefile|#|\.|\s)).+?:$/;
  const validLines = lines
    .filter((line) => validLineRegex.test(line))
    .map((line) => line.replace(':', ''));
  return validLines;
}

export default async function getMakefileTargetNames(
  makefileUri: vscode.Uri,
): Promise<string[] | null> {
  const makeFileExists = await exists(makefileUri.fsPath);

  if (!makeFileExists) {
    return null;
  }

  const rootPath = path.dirname(makefileUri.fsPath);
  const { stdout, stderr } = await exec(CMD, { cwd: rootPath });

  if (stderr) {
    trackException(new Error(stderr), {
      category: 'TaskProvider',
      action: 'getNames',
      stdout,
    });

    getOutputChannel().appendLine(stderr);
    showError();
    return null;
  }

  const targetNames = getResultLines(stdout);
  return targetNames;
}
