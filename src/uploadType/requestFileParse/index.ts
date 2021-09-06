
// const path = require('path');
import * as path from 'path';
import * as ts from 'typescript';
import type { IOptions } from './../mergeOptions'
import { getRapModuleId } from './../../utils'

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

interface IFileInfo {
  fileName: string;
  filePath: string;
  moduleId: number;
  content: string
}

// 
export type ITypeName = {
  resTypeName: string;
  reqTypeName: string;
  reqUrl: string;
  reqMethod: string;
  interfaceId: number;
} | null;

export interface IFuncInfo {
  funcName: string;
  body: string;
  comment: string;
  // 三种函数 定义 会被选中到导出
  funcType: 'CallExpression'| 'FunctionDeclaration'| 'ArrowFunction'
}

export function requestFileParse(
  filePath: string,
  formatFunc: (params: IFuncInfo) => ITypeName,
  config: IOptions,
) {
  const program = ts.createProgram([filePath], { allowJs: false });
  const sourceFile = program.getSourceFile(filePath);
// console.log(sourceFile.getText(sourceFile), 'sourceFile')
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  // 文件内容
  const content = printer.printFile(sourceFile)
  // 引入的 TypeOnly 文件
  // 文件名称  文件路径
  const importTypes: IImportTypes[] = [];
  // 导出的 接口函数
  const exportInterfaceFunc: IFuncInfo[] = [];

  const importType = {
    importNames: [],
    importPath: '',
  };

  // 当前文件不能放到 importType 中，  一个文件可能会有多个 文件导入的类型
  const fileInfo: IFileInfo = {
    filePath,
    fileName: path.basename(filePath).replace(/\.[a-z]+$/, ''),
    content,
    moduleId: getRapModuleId(content)
  }
  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node) && node.importClause.isTypeOnly) {
      //  只是查了  isNamedImports   还有一种 nameSpaceImport
      if (ts.isNamedImports(node.importClause.namedBindings)) {
        node.importClause.namedBindings.forEachChild(node => {
          // console.log(node.getText(sourceFile));
          importType.importNames.push(node.getText(sourceFile));
        });
        const importPath = node.moduleSpecifier.getText(sourceFile);
        const absolutePath = path.resolve(
          __dirname,
          filePath,
          '..',
          importPath.replace(/["']/g, ''),
        );
        node.moduleSpecifier.getText(sourceFile);
      
        importType.importPath = /ts$/.test(absolutePath) ? absolutePath : absolutePath + '.ts'
        node.moduleSpecifier.getText(sourceFile);
      }
      importTypes.push(importType);
    }

    // 导出的 函数定义
    if(ts.isFunctionDeclaration(node)  && isNodeExported(node)) {
      let comment = '';
      node.getChildren(sourceFile).forEach(el => {
        if (ts.isJSDoc(el)) {
          // ts.JSDoc.comment?: string | ts.NodeArray<ts.JSDocText | ts.JSDocLink>
          if(typeof el.comment == 'string') {
            comment = el.comment
          }
   
        }
      })
      exportInterfaceFunc.push({
        funcName: node.name.getText(sourceFile),
        comment,
        body: node.getText(sourceFile),
        funcType: 'FunctionDeclaration'
      });
      return
    }
 
    // 导出的 变量列表
    if (ts.isVariableStatement(node) && isNodeExported(node)) {
      let comment = '';
      node.getChildren(sourceFile).forEach(el => {
        if (ts.isJSDoc(el)) {
          // ts.JSDoc.comment?: string | ts.NodeArray<ts.JSDocText | ts.JSDocLink>
          if(typeof el.comment == 'string') {
            comment = el.comment
          }
   
        }
        if (ts.isVariableDeclarationList(el)) {
          // console.log(el, '==============');
          el.forEachChild(declarationNode => {
            // 不知道为啥没有推断出出来是  declarationNode  还要在收窄一次类型
            if (!ts.isVariableDeclaration(declarationNode)) return;
            const funcName = declarationNode.name.getText(sourceFile);
            declarationNode.forEachChild(functionNode => {
              // 函数调用
              const isCallExpression: boolean =  ts.isCallExpression(functionNode)
              // isCallExpression 判断不出来 - 导出的是不是一个函数
              //  要去找到这个函数定义的地方 可是函数可以定义在任何地方
              if(isCallExpression || ts.isArrowFunction(functionNode)) {
                exportInterfaceFunc.push({
                  funcName,
                  comment,
                  body: node.getText(sourceFile),
                  funcType: isCallExpression ? 'CallExpression' : 'ArrowFunction' 
                });
              }
            });
          });
        }
      });
    }
  });
  const funcTypes = exportInterfaceFunc.map(formatFunc).map((data, index) => {
    // 把 body 重新赋值上去，放在内部  避免 config  设置无用字段 
    if(data) {
      const { body, funcName } = exportInterfaceFunc[index]
      return {
        ...data,
        body,
        funcName
      }
    }
    return null
  }).filter(name => name);
  return {
    importType,
    funcTypes,
    fileInfo,
  };
}
