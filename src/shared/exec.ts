import cp from 'child_process';

type StdIo = { stdout: string; stderr: string };

// TODO: create a custom error to use in the reject(), containing the data as Properties
export default function exec(command: string, options: cp.ExecOptions): Promise<StdIo> {
  return new Promise<StdIo>((resolve, reject) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        // TODO maybe track the exception here in case other places are not handling it
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
