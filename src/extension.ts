// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

import {
    createParentDirectoryIfNecessary,
    logItemCompletion,
    logConclusion,
} from './new-component/helpers';
import {
    mkDirPromise,
    readFilePromiseRelative,
    writeFilePromise,
} from './new-component/utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(
        'Congratulations, your extension "new-react-components" is now active!'
    )

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand(
        "new-react-components.helloWorld",
        async (args) => {
            // console.log('argsxxxxx:', args);
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            // vscode.window.showInformationMessage('Hello World from new react components!111');

            await test(args);
            // const filePath = path.resolve(__dirname, '../src/new-component/new-component.js');

            // const t = vscode.window.createTerminal({
            //     name: 'test',
            //     cwd: args.fsPath
            // });
            // t.show()
            // t.sendText(`node ${filePath}`)
        }
    )

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function test(args: any) {
    const dir = args?.fsPath ?? './'

    // 选择语言
    const languageType = await vscode.window.showQuickPick([
        { value: "js", label: "JavaScript" },
        { value: "ts", label: "TypeScript" },
    ])

    const fileExtension = languageType?.value === "js" ? "js" : "tsx";
    const indexExtension = languageType?.value === "js" ? "js" : "ts";

    const exportMode = await vscode.window.showQuickPick(
        [
            { value: "export", label: "export" },
            { value: "", label: "export default" },
        ],
        {
            title: "请选择导出模式",
        }
    );
    const componentName = await vscode.window.showInputBox({
        placeHolder: '请输入组件名称'
    });


    const templatePath = `./templates/${indexExtension}${!!exportMode ? '-export' : ''}.js`;

    console.log('______templatePath_______', templatePath);

    const componentDir = `${dir}/${componentName}`;

    const filePath = `${componentDir}/${componentName}.${fileExtension}`;
    const indexPath = `${componentDir}/index.${indexExtension}`;


    const indexTemplate = `\
    export * from './${componentName}';
    export { default } from './${componentName}';
    `;

    createParentDirectoryIfNecessary(dir);

    const fullPathToComponentDir = path.resolve(componentDir);
    if (fs.existsSync(fullPathToComponentDir)) {
        // cancel(
        //     `Looks like this component already exists! There's already a component at ${fullPathToComponentDir}.\nPlease delete this directory and try again.`
        // );
        process.exit(0);
    }

    return await mkDirPromise(fullPathToComponentDir)
    .then(() => readFilePromiseRelative(templatePath))
    .then((template) => {
        logItemCompletion('Directory created.');
        return template;
    })
    .then((template) =>
        // Replace our placeholders with real data (so far, just the component name)
        template.replace(/COMPONENT_NAME/g, componentName)
    )
    .then((template) =>
        // Format it using prettier, to ensure style consistency, and write to file.
        writeFilePromise(filePath, template)
    )
    .then((template) => {
        logItemCompletion('Component built and saved to disk.');
        return template;
    })
    .then((template) =>
        // We also need the `index.js` file, which allows easy importing.
        writeFilePromise(indexPath, indexTemplate)
    )
    .then((template) => {
        logItemCompletion('Index file built and saved to disk.');
        return template;
    })
    .then((template) => {
        return logConclusion();
    })
    .catch((err) => {
        console.error(err);
    });

}
