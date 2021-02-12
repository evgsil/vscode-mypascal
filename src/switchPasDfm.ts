import * as vscode from "vscode";

export const focusWord = (editor: vscode.TextEditor, word: string) => {
  const offset = editor.document.getText().search(new RegExp(word));

  if (offset < 0) {
    return;
  }

  const newPos = editor.document.positionAt(offset);
  editor.selection = new vscode.Selection(newPos, newPos);
  editor.revealRange(
    new vscode.Range(
      newPos.line > 20 ? newPos.translate(-20, 0) : newPos,
      newPos.translate(20, 0)
    )
  );
};

export const switchPasDfm = () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const textAtCursor = editor.document.getText(
    editor.document.getWordRangeAtPosition(editor.selection.active)
  );

  const pathArray = editor.document.fileName.split(".");
  const oldExt = (pathArray.pop() || "").toLowerCase();
  const newPath =
    oldExt === "pas"
      ? [...pathArray, "dfm"].join(".")
      : [...pathArray, "pas"].join(".");

  vscode.workspace
    .openTextDocument(newPath)
    .then((doc) => vscode.window.showTextDocument(doc))
    .then((editor) => {
      if (oldExt === "pas") {
        // only focus when switching pas -> dfm
        focusWord(editor, textAtCursor);
      }
    });
};
