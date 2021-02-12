import * as vscode from "vscode";
import * as path from "path";

export const getConfig = (validate = false) => {
  const conf = vscode.workspace.getConfiguration("mypascal");

  const pathToDelphiBin = String(conf.get("pathToDelphiBin") ?? "");
  const pathToDpr = String(conf.get("pathToDpr") ?? "");

  if (validate) {
    if (!pathToDelphiBin) {
      throw new Error("pathToDelphiBin is not specified");
    }
    if (!pathToDpr) {
      throw new Error("pathToDpr is not specified");
    }
  }

  const pathToBds = path.join(pathToDelphiBin, "bds.exe");
  const pathToDproj = path.join(
    path.dirname(pathToDpr),
    path.basename(pathToDpr, path.extname(pathToDpr)) + ".dproj"
  );
  const pathToDsk = path.join(
    path.dirname(pathToDpr),
    path.basename(pathToDpr, path.extname(pathToDpr)) + ".dsk"
  );

  return {
    pathToDelphiBin,
    pathToBds,
    pathToDpr,
    pathToDproj,
    pathToDsk,
  };
};
