import vscode from 'vscode';

import { showGenericErrorNotification } from '../shared/errorNotifications';
import { fileReader } from '../shared/fileReader';
import getOutputChannel from '../shared/getOutputChannel';
import { trackException, trackExecutionTime } from '../telemetry/tracking';

/**
 * Excluding:
 * - special targets: https://www.gnu.org/software/make/manual/html_node/Special-Targets.html
 * - suffix rules: https://www.gnu.org/software/make/manual/html_node/Suffix-Rules.html
 * - pattern rules: https://www.gnu.org/software/make/manual/html_node/Pattern-Rules.html
 */
const excludesRegex = /^[.%]/;
const targetNameRegex = /^([\w-./ ]+)\s*:[^=]*/gi;

export const makefileParser = async (makefileUri: vscode.Uri): Promise<string[] | null> => {
  try {
    const targetNames = await trackExecutionTime(() => fileReader(makefileUri.fsPath, lineFilter), {
      category: 'Parsers',
      label: 'Parse Makefile',
    });
    return targetNames;
  } catch (error) {
    trackException(error, {
      category: 'Parsers',
      action: 'Parse Makefile',
    });
  }

  return null;
};

function lineFilter(line: string): string | null {
  const match = targetNameRegex.exec(line);

  if (!match?.[1]) {
    return null;
  }

  const targetName = match[1].trim();

  if (excludesRegex.test(targetName)) {
    return null;
  }

  return targetName;
}
