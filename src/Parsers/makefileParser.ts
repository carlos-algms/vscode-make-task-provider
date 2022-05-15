import { fileReader } from '../shared/fileReader';
import { trackException, trackExecutionTime } from '../telemetry/tracking';

/**
 * Excluding:
 * - special targets: https://www.gnu.org/software/make/manual/html_node/Special-Targets.html
 * - suffix rules: https://www.gnu.org/software/make/manual/html_node/Suffix-Rules.html
 * - pattern rules: https://www.gnu.org/software/make/manual/html_node/Pattern-Rules.html
 */
const excludesRegex = /^[.%]/;
const targetNameRegex = /^([\w-./ ]+)\s*:(?![:=?])/i;

export async function makefileParser(makefileFsPath: string): Promise<string[] | null> {
  try {
    const targetNames = await trackExecutionTime(
      () => fileReader(makefileFsPath, targetNameMatcher),
      {
        category: 'Parsers',
        label: 'Parse Makefile',
      },
    );
    return Array.from(new Set(targetNames));
  } catch (error) {
    trackException(error, {
      category: 'Parsers',
      action: 'Parse Makefile',
    });
  }

  return null;
}

/**
 * Returns the target name or null if it doesn't match
 */
export function targetNameMatcher(line: string): string | null {
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
