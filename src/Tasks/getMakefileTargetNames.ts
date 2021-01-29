import path from 'path';
import vscode from 'vscode';

import { MAKE_BIN } from '../shared/constants';
import { showGenericErrorNotification } from '../shared/errorNotifications';
import exec from '../shared/exec';
import exists from '../shared/exists';
import getOutputChannel from '../shared/getOutputChannel';
import { trackException } from '../telemetry/tracking';

// TODO maybe for better cross-OS, move to read-file instead of depending on make executable
const CMD = `${MAKE_BIN} --no-builtin-rules --no-builtin-variables --print-data-base --just-print`;

export default async function getMakefileTargetNames(
  makefileUri: vscode.Uri,
): Promise<string[] | null> {
  try {
    const makeFileExists = await exists(makefileUri.fsPath);

    if (!makeFileExists) {
      return null;
    }

    const rootPath = path.dirname(makefileUri.fsPath);
    // TODO: how to warn the user that `make` is not available?
    const { stdout, error } = await exec(CMD, { cwd: rootPath });

    if (error) {
      return null;
    }

    return extractNamesFromStdout(stdout);
  } catch (error) {
    trackException(error, {
      category: 'Tasks',
      action: 'getNames',
      label: 'Unknown Exception',
    });

    getOutputChannel().appendLine((<Error>error)?.message);
    showGenericErrorNotification();
  }
  return null;
}

function extractNamesFromStdout(result: string): string[] {
  const startAt = result.lastIndexOf('# Files');
  const lines = result.substr(startAt).split(/\r{0,1}\n/g);
  const validLineRegex = /^(?!(Makefile|#|\.|\s)).+?:$/;
  const validLines = lines
    .filter((line) => validLineRegex.test(line))
    .map((line) => line.replace(':', ''));
  return validLines;
}
