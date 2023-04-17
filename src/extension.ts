import * as vscode from 'vscode';
import {
  TabInputCustom,
  TabInputNotebook,
  TabInputNotebookDiff,
  TabInputTerminal,
  TabInputText,
  TabInputTextDiff,
  TabInputWebview,
  Uri,
} from 'vscode';

type TabContentData =
  | TabInputText
  | TabInputTextDiff
  | TabInputCustom
  | TabInputWebview
  | TabInputNotebook
  | TabInputNotebookDiff
  | TabInputTerminal
  | unknown;

let changeTabs = (withNumber: boolean) => async () => {
  // open a selector for all currently open tabs
  const tabs: TabWithUri[] = vscode.window.tabGroups.all.flatMap((tabGroup) => {
    return tabGroup.tabs.flatMap((tab) => {
      if (isInputWithUri(tab.input)) {
        return [{ label: tab.label, uri: tab.input.uri }];
      } else {
        return [];
      }
    });
  });
  const selected: string | undefined = await vscode.window.showQuickPick(
    tabs.map((t, i) => ((withNumber && i.toString() + ' | ') || '') + t.label),
    {
      title: 'Switch tabs',
      placeHolder: 'Select a tab to switch to',
      ignoreFocusOut: false,
      canPickMany: false,
    }
  );

  if (!!selected) {
    const tab = tabs.find((tab) => {
      return tab.label === selected;
    });

    if (tab !== undefined) {
      await vscode.commands.executeCommand('vscode.open', tab.uri);
    }
  } else {
    console.log('No tab selected');
  }
};

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'tab-switcher.go',
    changeTabs(false)
  );

  let disposableWithNumbers = vscode.commands.registerCommand(
    'tab-switcher.go.numbered',
    changeTabs(true)
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposableWithNumbers);
}

type TabWithUri = {
  label: string;
  uri: Uri;
};

function isInputWithUri(input: TabContentData): input is TabWithUri {
  return typeof input === 'object' && input !== null && 'uri' in input;
}

export function deactivate() {}
