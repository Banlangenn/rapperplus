import * as fs from 'fs';
// const path = require('path');
import * as path from 'path';
import * as ts from 'typescript';
import type { IOptions } from './../mergeOptions'

function isNodeExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}
interface IImportTypes {
  importPath: string;
  importNames: string[];
}

export type ITypeName = {
  returnType: string;
  paramsType: string;
  fetchUrl: string;
} | null;

export interface IFuncInfo {
  funcName: string;
  returnType: string;
  paramsType: any[] | string;
  body: string;
  comment: string;
}

export function requestFileParse(
  filePath: string,
  formatFunc: (params: IFuncInfo) => ITypeName,
  config: IOptions,
) {
  const program = ts.createProgram([filePath], { allowJs: false });
  const sourceFile = program.getSourceFile(filePath);

  // const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  // 引入的 TypeOnly 文件
  const importTypes: IImportTypes[] = [];
  // 导出的 接口函数
  const exportInterfaceFunc: IFuncInfo[] = [];

  const importType = {
    importNames: [],
    importPath: '',
  };
  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node) && node.importClause.isTypeOnly) {
      //  只是查了  isNamedImports   还有一种 nameSpaceImport
      if (ts.isNamedImports(node.importClause.namedBindings)) {
        node.importClause.namedBindings.forEachChild(node => {
          // console.log(node.getText(sourceFile));
          importType.importNames.push(node.getText(sourceFile));
        });
        const importPath = node.moduleSpecifier.getText(sourceFile);
        importType.importPath = path.resolve(
          __dirname,
          filePath,
          '..',
          importPath.replace(/["']/g, ''),
        );
        node.moduleSpecifier.getText(sourceFile);
      }
      importTypes.push(importType);
    }

    // 导出的 变量列表
    if (ts.isVariableStatement(node) && isNodeExported(node)) {
      let comment = '';
      node.getChildren(sourceFile).forEach(el => {
        if (ts.isJSDoc(el)) {
          // const a = ts.getCommentRange(el);
          // if (ts.isArrayTypeNode(el)) {
          //   console.log(el);
          // }
          comment = el.comment as string;
        }
        if (ts.isVariableDeclarationList(el)) {
          // console.log(e);
          el.forEachChild(declarationNode => {
            // 不知道为啥没有推断出出来是  declarationNode  还要在收窄一次类型
            if (!ts.isVariableDeclaration(declarationNode)) return;
            declarationNode.forEachChild(arrowFunctionNode => {
              if (ts.isArrowFunction(arrowFunctionNode)) {
                const funcName = declarationNode.name.getText(sourceFile);
                const paramsType = arrowFunctionNode.parameters.map(e => {
                  return {
                    //   source: printer.printNode(ts.EmitHint.Unspecified, e, sourceFile),
                    [e.name.getText(sourceFile)]: e.type.getText(sourceFile),
                  };
                });
                const returnType = arrowFunctionNode.type.getText(sourceFile);
                exportInterfaceFunc.push({
                  paramsType,
                  returnType,
                  funcName,
                  comment,
                  body: arrowFunctionNode.body.getText(sourceFile),
                });
              }
            });
          });
        }
      });
    }
  });
  const funcType = exportInterfaceFunc.map(formatFunc);
  return {
    importType,
    funcType,
  };
}
