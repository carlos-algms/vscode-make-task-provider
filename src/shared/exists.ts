import fs from 'fs';

/**
 * Checks if a file exists in the given path
 */
export default function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    fs.access(file, fs.constants.F_OK, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}
