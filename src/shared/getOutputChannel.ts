import vscode from 'vscode';

let channel: vscode.OutputChannel;
export default function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Make Auto Detection');
  }
  return channel;
}
