import vscode from 'vscode';

import { APP_NAME } from './constants';

let channel: vscode.OutputChannel;

export default function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel(APP_NAME);
  }

  return channel;
}
