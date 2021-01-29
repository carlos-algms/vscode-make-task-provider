import cp, { ExecException } from 'child_process';

import { trackException } from '../telemetry/tracking';

import getOutputChannel from './getOutputChannel';

export type ExecStdIoResult = {
  stdout: string;
  stderr: string;
  error?: ExecException;
};

/**
 * Executes a command string in the users shell
 * Never throws an Error, check the `result.error`
 */
export default function exec(command: string, options: cp.ExecOptions): Promise<ExecStdIoResult> {
  return new Promise<ExecStdIoResult>((resolve) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        resolve({ error, stdout, stderr });

        trackException(error, {
          action: 'exec',
          cmd: error.cmd,
          stdout,
        });

        getOutputChannel().appendLine(error.message);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}
