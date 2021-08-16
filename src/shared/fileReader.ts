import fs from 'fs';
import readline from 'readline';

/**
 * Reads a file line by line and filters the output
 */
export const fileReader = (
  fsPath: string,
  filterLine: (l: string) => string | null | false | undefined = (l) => l,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const validLines: string[] = [];

    const inputStream = fs.createReadStream(fsPath);

    const rl = readline.createInterface({
      input: inputStream,
      terminal: false,
    });

    rl.on('line', (line) => {
      const valid = filterLine(line);

      if (valid) {
        validLines.push(valid);
      }
    });

    rl.on('error', (error) => {
      reject(error);
    });

    rl.on('close', () => {
      resolve(validLines);
    });
  });
};
