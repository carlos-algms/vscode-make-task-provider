import fs from 'fs';

import { trackException } from '../telemetry/tracking';

import getOutputChannel from './getOutputChannel';

/**
 * Checks if a file exists in the given path
 */
export default function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fs.access(file, fs.constants.F_OK, (error) => {
      if (error) {
        getOutputChannel().appendLine(error.message);

        trackException(error, {
          category: 'Files',
          action: 'exists',
          filePath: error.path,
          errno: error.errno,
          code: error.code,
        });

        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
