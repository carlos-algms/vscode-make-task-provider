import vscode from 'vscode';

import packageJSON from '../../package.json';

let channel: vscode.OutputChannel;

export default function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel(packageJSON.name);
  }

  return channel;
}
