import path from 'path';

function removeExtension(filePath: string) {
  const normalizedPath = filePath.replaceAll(/\\/g, '/');
  return path.posix.join(
    path.posix.dirname(normalizedPath),
    path.posix.basename(normalizedPath, path.posix.extname(normalizedPath))
  );
}

export function resolveBuildDir(buildDir: string, rootDir: string) {
  return path.isAbsolute(buildDir) ? buildDir : path.resolve(rootDir, buildDir);
}

export function resolveRegleExportsTemplatePath(buildDir: string, rootDir: string) {
  return path.join(resolveBuildDir(buildDir, rootDir), 'regle-exports.ts');
}

export function resolveTemplateImportPath(templatePath: string, importPath: string) {
  // Keep the generated import portable across Docker host paths and Nuxt cached buildDir locations.
  // See https://github.com/victorgarciaesgi/regle/issues/344
  const relativePath = path.relative(path.dirname(templatePath), importPath);
  const importPathWithoutExtension = removeExtension(relativePath);

  if (path.isAbsolute(importPathWithoutExtension) || importPathWithoutExtension.startsWith('.')) {
    return importPathWithoutExtension;
  }

  return `./${importPathWithoutExtension}`;
}
