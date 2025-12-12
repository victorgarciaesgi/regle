import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ApiParameter {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

export interface ApiMetadata {
  name: string;
  kind: 'function' | 'const' | 'type' | 'interface' | 'class';
  description: string;
  parameters: ApiParameter[];
  returnType: string;
  example: string;
  tags: Record<string, string>;
}

export interface PackageApi {
  [packageName: string]: ApiMetadata[];
}

const PACKAGES: { name: string; indexPath: string }[] = [
  { name: '@regle/core', indexPath: '../../core/src/index.ts' },
  { name: '@regle/rules', indexPath: '../../rules/src/index.ts' },
  { name: '@regle/schemas', indexPath: '../../schemas/src/index.ts' },
  { name: '@regle/nuxt', indexPath: '../../nuxt/src/module.ts' },
];

/**
 * Get JSDoc comment from a node
 */
function getJSDocComment(node: ts.Node): string {
  const jsDocComments = (node as any).jsDoc as ts.JSDoc[] | undefined;
  if (!jsDocComments || jsDocComments.length === 0) return '';

  const jsDoc = jsDocComments[0];
  if (typeof jsDoc.comment === 'string') {
    return jsDoc.comment;
  }
  if (Array.isArray(jsDoc.comment)) {
    return jsDoc.comment.map((part) => (typeof part === 'string' ? part : part.text)).join('');
  }
  return '';
}

/**
 * Get JSDoc tags from a node
 */
function getJSDocTags(node: ts.Node): Record<string, string> {
  const tags: Record<string, string> = {};
  const jsDocComments = (node as any).jsDoc as ts.JSDoc[] | undefined;
  if (!jsDocComments) return tags;

  for (const jsDoc of jsDocComments) {
    if (jsDoc.tags) {
      for (const tag of jsDoc.tags) {
        const tagName = tag.tagName.text;
        let tagValue = '';
        if (typeof tag.comment === 'string') {
          tagValue = tag.comment;
        } else if (Array.isArray(tag.comment)) {
          tagValue = tag.comment.map((part) => (typeof part === 'string' ? part : part.text)).join('');
        }
        tags[tagName] = tagValue;
      }
    }
  }

  return tags;
}

/**
 * Extract example code from JSDoc @example tag
 */
function getExampleFromTags(tags: Record<string, string>): string {
  const example = tags['example'] || '';
  // Clean up the example - remove markdown code fences
  return example.replace(/```[\w]*\n?/g, '').trim();
}

/**
 * Get parameter descriptions from JSDoc @param tags
 */
function getParamDescriptions(node: ts.Node): Map<string, string> {
  const descriptions = new Map<string, string>();
  const jsDocComments = (node as any).jsDoc as ts.JSDoc[] | undefined;
  if (!jsDocComments) return descriptions;

  for (const jsDoc of jsDocComments) {
    if (jsDoc.tags) {
      for (const tag of jsDoc.tags) {
        if (ts.isJSDocParameterTag(tag)) {
          const paramName = tag.name.getText();
          let comment = '';
          if (typeof tag.comment === 'string') {
            comment = tag.comment;
          } else if (Array.isArray(tag.comment)) {
            comment = tag.comment.map((part) => (typeof part === 'string' ? part : part.text)).join('');
          }
          descriptions.set(paramName, comment);
        }
      }
    }
  }

  return descriptions;
}

/**
 * Simplify a type string for readability
 */
function simplifyType(typeString: string): string {
  // Truncate very long types
  if (typeString.length > 200) {
    return typeString.substring(0, 200) + '...';
  }
  return typeString;
}

/**
 * Extract API metadata from a source file
 */
function extractApiFromSourceFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  exportedNames: Set<string>
): ApiMetadata[] {
  const apis: ApiMetadata[] = [];

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          const name = declaration.name.text;
          if (isExported || exportedNames.has(name)) {
            const symbol = checker.getSymbolAtLocation(declaration.name);
            if (symbol) {
              const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
              const typeString = checker.typeToString(type);
              const description = getJSDocComment(node) || getJSDocComment(declaration);
              const tags = { ...getJSDocTags(node), ...getJSDocTags(declaration) };

              let kind: ApiMetadata['kind'] = 'const';
              if (typeString.includes('=>') || typeString.includes('Function')) {
                kind = 'function';
              }

              const parameters: ApiParameter[] = [];
              const paramDescriptions = getParamDescriptions(node);

              const callSignatures = type.getCallSignatures();
              if (callSignatures.length > 0) {
                const sig = callSignatures[0];
                for (const param of sig.getParameters()) {
                  const paramType = checker.getTypeOfSymbolAtLocation(param, declaration);
                  const paramDecl = param.valueDeclaration;
                  const isOptional = paramDecl && ts.isParameter(paramDecl) ? !!paramDecl.questionToken : false;

                  parameters.push({
                    name: param.name,
                    type: simplifyType(checker.typeToString(paramType)),
                    description: paramDescriptions.get(param.name) || '',
                    optional: isOptional,
                  });
                }
              }

              let returnType = '';
              if (callSignatures.length > 0) {
                returnType = simplifyType(checker.typeToString(callSignatures[0].getReturnType()));
              }

              apis.push({
                name,
                kind,
                description: description.trim(),
                parameters,
                returnType,
                example: getExampleFromTags(tags),
                tags: Object.fromEntries(
                  Object.entries(tags).filter(([key]) => !['example', 'param', 'returns'].includes(key))
                ),
              });
            }
          }
        }
      }
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

      if (isExported || exportedNames.has(name)) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) {
          const type = checker.getTypeOfSymbolAtLocation(symbol, node);
          const description = getJSDocComment(node);
          const tags = getJSDocTags(node);
          const paramDescriptions = getParamDescriptions(node);

          const parameters: ApiParameter[] = [];
          for (const param of node.parameters) {
            if (ts.isIdentifier(param.name)) {
              const paramName = param.name.text;
              const paramSymbol = checker.getSymbolAtLocation(param.name);
              const paramType = paramSymbol ? checker.getTypeOfSymbolAtLocation(paramSymbol, param) : undefined;

              parameters.push({
                name: paramName,
                type: paramType ? simplifyType(checker.typeToString(paramType)) : 'unknown',
                description: paramDescriptions.get(paramName) || '',
                optional: !!param.questionToken,
              });
            }
          }

          const returnType = node.type
            ? node.type.getText()
            : checker.typeToString(type.getCallSignatures()[0]?.getReturnType() || type);

          apis.push({
            name,
            kind: 'function',
            description: description.trim(),
            parameters,
            returnType: simplifyType(returnType),
            example: getExampleFromTags(tags),
            tags: Object.fromEntries(
              Object.entries(tags).filter(([key]) => !['example', 'param', 'returns'].includes(key))
            ),
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return apis;
}

/**
 * Get exported names from an index file (recursively following export *)
 */
function getExportedNames(
  sourceFile: ts.SourceFile,
  program: ts.Program,
  visited: Set<string> = new Set()
): Set<string> {
  const names = new Set<string>();
  const filePath = sourceFile.fileName;

  if (visited.has(filePath)) return names;
  visited.add(filePath);

  function visit(node: ts.Node) {
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          names.add(element.name.text);
        }
      }

      if (!node.exportClause && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const modulePath = node.moduleSpecifier.text;
        if (modulePath.startsWith('.')) {
          const dir = path.dirname(filePath);
          let resolvedPath = path.resolve(dir, modulePath);

          if (!resolvedPath.endsWith('.ts')) {
            if (fs.existsSync(resolvedPath + '.ts')) {
              resolvedPath += '.ts';
            } else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) {
              resolvedPath = path.join(resolvedPath, 'index.ts');
            }
          }

          const reExportedFile = program.getSourceFile(resolvedPath);
          if (reExportedFile) {
            const reExportedNames = getExportedNames(reExportedFile, program, visited);
            reExportedNames.forEach((n) => names.add(n));
          }
        }
      }
    }

    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            names.add(decl.name.text);
          }
        }
      }
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        names.add(node.name.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return names;
}

/**
 * Build API metadata for all packages
 */
export function buildApiMetadata(): PackageApi {
  const api: PackageApi = {};

  for (const pkg of PACKAGES) {
    const indexPath = path.resolve(__dirname, pkg.indexPath);

    if (!fs.existsSync(indexPath)) {
      console.warn(`Package index not found: ${indexPath}`);
      api[pkg.name] = [];
      continue;
    }

    const allSourceFiles = new Set<string>();

    function collectSourceFiles(filePath: string) {
      if (allSourceFiles.has(filePath)) return;
      if (!fs.existsSync(filePath)) return;

      allSourceFiles.add(filePath);

      const content = fs.readFileSync(filePath, 'utf-8');
      const dir = path.dirname(filePath);

      const importExportRegex = /from\s+['"](\.[^'"]+)['"]/g;
      let match;
      while ((match = importExportRegex.exec(content)) !== null) {
        const modulePath = match[1];
        let resolvedPath = path.resolve(dir, modulePath);

        if (!resolvedPath.endsWith('.ts')) {
          if (fs.existsSync(resolvedPath + '.ts')) {
            resolvedPath += '.ts';
          } else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) {
            resolvedPath = path.join(resolvedPath, 'index.ts');
          }
        }

        collectSourceFiles(resolvedPath);
      }
    }

    collectSourceFiles(indexPath);

    const program = ts.createProgram(Array.from(allSourceFiles), {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      noEmit: true,
    });

    const checker = program.getTypeChecker();
    const packageApis: ApiMetadata[] = [];

    const indexSourceFile = program.getSourceFile(indexPath);
    if (!indexSourceFile) {
      api[pkg.name] = [];
      continue;
    }

    const exportedNames = getExportedNames(indexSourceFile, program);

    for (const sourceFile of program.getSourceFiles()) {
      if (sourceFile.fileName.includes('node_modules')) continue;
      if (!allSourceFiles.has(sourceFile.fileName)) continue;

      const apis = extractApiFromSourceFile(sourceFile, checker, exportedNames);
      packageApis.push(...apis);
    }

    const uniqueApis = new Map<string, ApiMetadata>();
    for (const apiItem of packageApis) {
      const existing = uniqueApis.get(apiItem.name);
      if (!existing || (apiItem.description && !existing.description)) {
        uniqueApis.set(apiItem.name, apiItem);
      }
    }

    const filteredApis = Array.from(uniqueApis.values())
      .filter((a) => exportedNames.has(a.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    api[pkg.name] = filteredApis;
  }

  return api;
}
