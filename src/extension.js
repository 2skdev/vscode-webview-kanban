const vscode = require('vscode');

const path = require('path');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('todo-md-kanban.openKanban', function () {
        // public root
        const root = path.join(context.extensionPath, 'src', 'web');

        // markdown file path config
        const config = vscode.workspace.getConfiguration('todo-md-kanban');
        const md = config.get('path');

        // check markdown file
        if(md == '') {
            vscode.window.showErrorMessage('"todo-md-kanban.path" not set');
            return;
        }
        else if(!fs.existsSync(md)) {
            vscode.window.showErrorMessage(`"${md}" not exist`);
            return;
        }

        // watch file
        fs.watch(md, {}, () => {
            if(!this._stop) {
                vscode.window.showInformationMessage(`"${md}" updated`);
                panel.webview.postMessage({command: 'read', data: fs.readFileSync(md, 'utf-8')});
            }
            this._stop = true;
            setTimeout(() => { this._stop = false}, 100);
        })
        ignoreWatcher = (fn) => {
            this._stop = true;
            fn();
            setTimeout(() => { this._stop = false }, 100);
        }

        // webview panel
        const panel = vscode.window.createWebviewPanel(
            'kanban',
            'ToDo.md Kanban',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(root)]
            }
        );

        // message
        panel.webview.onDidReceiveMessage((message) => {
            switch(message.command) {
                case 'created':
                    panel.webview.postMessage({command: 'read', data: fs.readFileSync(md, 'utf-8')});
                    break;
                case 'write':
                    ignoreWatcher(() => {
                        fs.writeFileSync(md, message.data);
                    });
                    break;
                default:
                    break;
            }
        });

        // load html
        let html = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
        
        // replace path
        const asWebviewUri = (uri) => {
            return panel.webview.asWebviewUri(vscode.Uri.file(path.join(root, uri)));
        }
        html = html.replace(/(href|src)="([^"]*)"/g, (all, group1, group2) => {
            return `${group1}="${asWebviewUri(group2)}"`;
        })

        panel.webview.html = html;
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
