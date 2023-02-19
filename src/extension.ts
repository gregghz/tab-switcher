import * as vscode from 'vscode';
import { TabInputCustom, TabInputNotebook, TabInputNotebookDiff, TabInputTerminal, TabInputText, TabInputTextDiff, TabInputWebview, Uri } from 'vscode';

type TabContentData = TabInputText | TabInputTextDiff | TabInputCustom | TabInputWebview | TabInputNotebook | TabInputNotebookDiff | TabInputTerminal | unknown;

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('tab-switcher.go', async () => {
		// open a selector for all currently open tabs
		const tabs: vscode.Tab[] = vscode.window.tabGroups.all.flatMap((tabGroup) => {
			return tabGroup.tabs;
		});
		const selected: string | undefined = await vscode.window.showQuickPick(tabs.map((t) => t.label), {
			title: 'Switch tabs',
			placeHolder: 'Select a tab to switch to',
			ignoreFocusOut: false,
			canPickMany: false,
		});

		if (!!selected) {
			const tab = tabs.find((tab) => {
				return tab.label === selected;
			});

			if (tab !== undefined && hasUri(tab?.input)) {
				await vscode.commands.executeCommand('vscode.open', tab.input.uri);
			}
		} else {
			console.log('No tab selected');
		}
	});

	context.subscriptions.push(disposable);
}

type HasUri = {
	uri: Uri,
};

function hasUri(input: TabContentData): input is HasUri {
	return typeof input === 'object' && input !== null && 'uri' in input;
}

// This method is called when your extension is deactivated
export function deactivate() { }
