import path from 'path';
import vscode from 'vscode';

import { getMakeExecutablePath } from '../shared/config';
import { showGenericErrorNotification } from '../shared/errorNotifications';
import exec from '../shared/exec';
import exists from '../shared/exists';
import getOutputChannel from '../shared/getOutputChannel';
import { trackException } from '../telemetry/tracking';

// TODO maybe for better cross-OS, move to read-file instead of depending on make executable
const MAKE_PARAMS = `--print-data-base --just-print`;

export default async function getMakefileTargetNames(
  makefileUri: vscode.Uri,
  folder: vscode.WorkspaceFolder,
): Promise<string[] | null> {
  try {
    const makeFileExists = await exists(makefileUri.fsPath);

    if (!makeFileExists) {
      return null;
    }

    const makeBin = getMakeExecutablePath(folder);
    const makefile = path.basename(makefileUri.fsPath);
    const cmd = `${makeBin} -f ${makefile} ${MAKE_PARAMS}`;

    const rootPath = path.dirname(makefileUri.fsPath);

    // TODO: how to warn the user that `make` is not available?
    const { stdout, error } = await exec(cmd, { cwd: rootPath });

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
  const validLineRegex = /^(?!(Makefile|#|\.|\s)).+?:/;
  const notATarget = '# Not a target';
  const validLines = lines
    .filter((line, i, list) => validLineRegex.test(line) && !list[i - 1].startsWith(notATarget))
    .map((line) => line.split(':')[0]);
  return validLines;
}
