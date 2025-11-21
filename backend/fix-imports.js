#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = findTsFiles(join(__dirname, 'src'));

let totalFixed = 0;
let filesChanged = 0;

files.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  const originalContent = content;
  let fileFixed = 0;

  // Fix imports with @/ path alias (without .js extension)
  // Pattern: from '@/...' or from "@/..."
  content = content.replace(
    /from\s+(['"])@\/([^'"]+?)(?<!\.js)(?<!\.ts)\1/g,
    (match, quote, path) => {
      fileFixed++;
      return `from ${quote}@/${path}.js${quote}`;
    }
  );

  // Fix relative imports (without .js extension)
  // Pattern: from './' or from '../' 
  content = content.replace(
    /from\s+(['"])(\.\.[\/\\].*?|\.\/.*?)(?<!\.js)(?<!\.ts)\1/g,
    (match, quote, path) => {
      fileFixed++;
      return `from ${quote}${path}.js${quote}`;
    }
  );

  if (content !== originalContent) {
    writeFileSync(file, content, 'utf-8');
    filesChanged++;
    totalFixed += fileFixed;
    console.log(`✓ Fixed ${fileFixed} imports in: ${file.replace(__dirname + '/', '')}`);
  }
});

console.log(`\n✅ Done! Fixed ${totalFixed} imports in ${filesChanged} files.`);
