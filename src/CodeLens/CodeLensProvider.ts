import vscode from 'vscode';

import { targetNameMatcher } from '../Parsers/makefileParser';
import { COMMANDS } from '../shared/config';

export class MakefileCodeLensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = [];

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const text = document.getText().split('\n');
    const uniques = new Set<string>();

    this.codeLenses = text.reduce<vscode.CodeLens[]>((lenses, line, i) => {
      const targetName = targetNameMatcher(line);

      if (targetName && !uniques.has(targetName)) {
        uniques.add(targetName);

        const position = new vscode.Position(i, 0);
        const range = document.getWordRangeAtPosition(position);

        if (range) {
          const codeLens = new vscode.CodeLens(range, {
            title: ` ▶ make ${targetName}`,
            tooltip: `Click to run 'make ${targetName}' in a terminal`,
            command: COMMANDS.executeTarget,
            arguments: [targetName, document.uri],
          });

          lenses.push(codeLens);
        }
      }

      return lenses;
    }, []);

    return this.codeLenses;
  }
}
