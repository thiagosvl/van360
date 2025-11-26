/**
 * Script para encontrar variáveis e funções não definidas/importadas
 * 
 * Este script analisa arquivos TypeScript/TSX e verifica se todas as
 * funções/variáveis usadas estão importadas ou definidas.
 * 
 * Uso: node scripts/check-undefined-vars.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios para verificar
const DIRS_TO_CHECK = [
  'src',
];

// Extensões de arquivo para verificar
const FILE_EXTENSIONS = ['.ts', '.tsx'];

// Funções/variáveis globais que não precisam ser importadas
const GLOBAL_VARS = new Set([
  'console', 'window', 'document', 'navigator', 'localStorage', 'sessionStorage',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'fetch', 'Promise', 'Array', 'Object', 'String', 'Number', 'Boolean',
  'Date', 'Math', 'JSON', 'RegExp', 'Error', 'TypeError', 'ReferenceError',
  'React', 'ReactDOM', 'useState', 'useEffect', 'useCallback', 'useMemo',
  'useRef', 'useContext', 'useReducer', 'lazy', 'Suspense', 'Fragment',
]);

// Hooks do React que são globais (se estiverem no escopo)
const REACT_HOOKS = new Set([
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
  'useContext', 'useReducer', 'lazy', 'Suspense', 'Fragment',
]);

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules, .git, dist, build, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        getAllFiles(filePath, fileList);
      }
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function extractImports(content) {
  const imports = new Set();
  
  // Extrair imports: import { X, Y } from '...'
  const namedImports = content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of namedImports) {
    const items = match[1].split(',').map(s => s.trim().split(' as ')[0].trim());
    items.forEach(item => imports.add(item));
  }
  
  // Extrair imports: import X from '...'
  const defaultImports = content.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of defaultImports) {
    imports.add(match[1]);
  }
  
  // Extrair imports: import * as X from '...'
  const namespaceImports = content.matchAll(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of namespaceImports) {
    imports.add(match[1]);
  }
  
  return imports;
}

function extractFunctionCalls(content) {
  const calls = new Set();
  
  // Extrair chamadas de função: functionName(...)
  // Ignorar métodos de objeto: obj.method()
  const functionCallRegex = /(?:^|[^.\w])([A-Z][a-zA-Z0-9_]*|use[A-Z][a-zA-Z0-9_]*)\s*\(/g;
  let match;
  
  while ((match = functionCallRegex.exec(content)) !== null) {
    const funcName = match[1];
    if (funcName && !GLOBAL_VARS.has(funcName)) {
      calls.add(funcName);
    }
  }
  
  return calls;
}

function extractVariableUsage(content) {
  const vars = new Set();
  
  // Extrair uso de variáveis: const x = varName
  // Mas isso é mais complexo, vamos focar em funções primeiro
  
  return vars;
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    const calls = extractFunctionCalls(content);
    
    // Verificar se todas as chamadas estão importadas ou são globais
    const undefinedCalls = [];
    for (const call of calls) {
      if (!imports.has(call) && !GLOBAL_VARS.has(call)) {
        // Verificar se é uma função definida no mesmo arquivo
        const functionDefRegex = new RegExp(`(?:function|const|export\\s+(?:function|const))\\s+${call}\\s*[=(]`, 'g');
        if (!functionDefRegex.test(content)) {
          undefinedCalls.push(call);
        }
      }
    }
    
    return {
      file: filePath,
      undefinedCalls: undefinedCalls.length > 0 ? undefinedCalls : null,
    };
  } catch (error) {
    return {
      file: filePath,
      error: error.message,
    };
  }
}

// Executar verificação
console.log('🔍 Verificando variáveis/funções não definidas...\n');

const allFiles = [];
DIRS_TO_CHECK.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    getAllFiles(fullPath, allFiles);
  }
});

console.log(`📁 Encontrados ${allFiles.length} arquivos para verificar\n`);

const results = allFiles.map(checkFile);
const problems = results.filter(r => r.undefinedCalls || r.error);

if (problems.length === 0) {
  console.log('✅ Nenhum problema encontrado!');
} else {
  console.log(`⚠️  Encontrados ${problems.length} arquivos com possíveis problemas:\n`);
  
  problems.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.file}`);
      console.log(`   Erro: ${result.error}\n`);
    } else if (result.undefinedCalls) {
      console.log(`⚠️  ${result.file}`);
      console.log(`   Funções possivelmente não definidas: ${result.undefinedCalls.join(', ')}\n`);
    }
  });
}

console.log('\n💡 Dica: Use o TypeScript compiler (tsc --noEmit) para verificação mais precisa!');

