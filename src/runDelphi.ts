import * as vscode from "vscode";
import * as fs from "fs";
import { getConfig } from "./config";
import { exec, execSync } from "child_process";

const stringifyIni = (obj: {
  [key: string]: {
    [key: string]: string | number;
  };
}) => {
  return Object.entries(obj)
    .map(([key, val]) =>
      [
        `[${key}]`,
        ...Object.entries(val).map(([key, val]) => `${key}=${val}`),
      ].join("\r\n")
    )
    .join("\r\n\r\n");
};

const quoteStr = (str: string) => `'` + str.split(`'`).join(`''`) + `'`;

interface DskView {
  CustomEditViewType: "TEditView";
  Module: string;
  CursorX: number;
  CursorY: number;
  TopLine: number;
  LeftCol: number;
  EditViewName: string;
}

const generateDskFile = (fileName: string) => {
  const views: Array<DskView> = vscode.window.visibleTextEditors.map((ed) => {
    return {
      CustomEditViewType: "TEditView",
      Module: ed.document.fileName,
      CursorX: ed.selection.active.line,
      CursorY: ed.selection.active.character,
      TopLine: ed.visibleRanges[0].start.line,
      LeftCol: 1,
      EditViewName: ed.document.fileName,
    };
  });

  const breakpoints: Array<string> = vscode.debug.breakpoints
    .map((b) => {
      if (b instanceof vscode.SourceBreakpoint) {
        return [
          quoteStr(b.location.uri.fsPath), // file path
          b.location.range.start.line + 1, // line number
          quoteStr(b.condition ?? ""), // condition
          Number.parseInt(b.hitCondition ?? "0") ?? 0, // pass count
          b.enabled ? 1 : 0, // enabled
          quoteStr(""), // group
          b.logMessage ? 0 : 1, // break  (if log message specified than do not break)
          0, // ?
          0, // ?
          quoteStr(b.logMessage ?? ""), // log message
          1,
          quoteStr(""), // eval expression
          quoteStr(""), // enable group
          quoteStr(""), // disable group
          0,
          quoteStr(""), // thread
        ].join(",");
      } else {
        return "";
      }
    })
    .filter((i) => !!i);

  const dsk = {
    Modules: {
      ...views.reduce(
        (acc, val, idx) => ({ ...acc, [`Module${idx}`]: val.Module }),
        {} as any
      ),
      Count: views.length,
      EditWindowCount: 1,
    },
    ...views.reduce(
      (acc, val, idx) => ({
        ...acc,
        [val.Module]: {
          ModuleType: "TSourceModule",
          FormState: 1,
          FormOnTop: 0,
        },
      }),
      {}
    ),
    EditWindow0: {
      ViewCount: views.length,
      CurrentEditView:
        vscode.window.activeTextEditor?.document.fileName ??
        views[0]?.EditViewName ??
        "",
      ...views.reduce((acc, val, idx) => ({ ...acc, [`View${idx}`]: idx }), {}),
    },
    ...views.reduce((acc, val, idx) => ({ ...acc, [`View${idx}`]: val }), {}),
    Breakpoints: {
      Count: breakpoints.length,
      ...breakpoints.reduce(
        (acc, val, idx) => ({ ...acc, [`Breakpoint${idx}`]: val }),
        {}
      ),
    },
  };
  fs.writeFileSync(fileName, stringifyIni(dsk));
};

export const runDelphi = () => {
  try {
    const config = getConfig(true);
    generateDskFile(config.pathToDsk);
    try {
      execSync("%windir%\\system32\\taskkill.exe /F /IM bds.exe");
    } catch {}
    exec(`"${config.pathToBds}" ${config.pathToDpr}`);
  } catch (error) {
    console.error(error);
  }
};
