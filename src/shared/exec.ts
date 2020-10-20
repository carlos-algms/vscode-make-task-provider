import cp from 'child_process';
type StdIo = { stdout: string; stderr: string };

export default function exec(command: string, options: cp.ExecOptions): Promise<StdIo> {
  return new Promise<StdIo>((resolve, reject) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}
