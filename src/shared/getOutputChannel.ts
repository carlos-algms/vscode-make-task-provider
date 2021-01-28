import vscode from 'vscode';

import { name } from '../../package.json';

let channel: vscode.OutputChannel;

export default function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel(name);
  }

  return channel;
}
