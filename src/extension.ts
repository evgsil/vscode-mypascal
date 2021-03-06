// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { switchPasDfm } from "./switchPasDfm";
import { runDelphi } from "./runDelphi";
import { getConfig } from "./config";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "mypascal" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("mypascal.switchPasDfm", switchPasDfm)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mypascal.runDelphi", runDelphi)
  );

  try {
    const config = getConfig();
    if (config.pathToDpr) {
      vscode.commands.executeCommand(
        "omnipascal.loadProject",
        config.pathToDpr
      );
    }
  } catch (error) {
    console.error(error);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
