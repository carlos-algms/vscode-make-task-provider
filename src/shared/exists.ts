import fs from 'fs';

export default function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, _reject) => {
    fs.exists(file, (value) => {
      resolve(value);
    });
  });
}
