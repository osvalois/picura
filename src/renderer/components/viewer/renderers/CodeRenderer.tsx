import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ViewerSettings } from '../utils/viewerConfig';

interface CodeRendererProps {
  content: string;
  settings: ViewerSettings;
  language?: string;
  fileName?: string | undefined;
  onCopy?: ((code: string) => void) | undefined;
  className?: string;
}

/**
 * Componente para renderizar bloques de código con resaltado de sintaxis
 */
const CodeRenderer: React.FC<CodeRendererProps> = ({
  content,
  settings,
  language,
  fileName,
  onCopy,
  className = ''
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Detectar el lenguaje a partir del nombre de archivo
  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      rb: 'ruby',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      php: 'php',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
      html: 'html',
      css: 'css',
      scss: 'scss',
      md: 'markdown',
      sh: 'bash',
      bash: 'bash',
      ps1: 'powershell'
    };
    
    return ext ? (languageMap[ext] || 'text') : 'text';
  };
  
  const detectedLanguage = language || (fileName ? getLanguageFromFileName(fileName) : 'text');
  
  // Seleccionar el tema según la configuración
  const getCodeStyle = () => {
    const isDarkTheme = settings.theme.colors.background.includes('#0d') || settings.theme.colors.background.includes('rgb(13');
    
    // Selección simple por modo claro/oscuro
    return isDarkTheme ? vscDarkPlus : vs;
    
    // Versión más avanzada con múltiples temas (para futuras versiones)
    // const themeMap = {
    //   'vscode': isDarkTheme ? vscDarkPlus : vs,
    //   'material': isDarkTheme ? materialDark : materialLight,
    //   'duotone': isDarkTheme ? duotoneDark : duotoneLight,
    //   'solarized': isDarkTheme ? okaidia : solarizedlight
    // };
    // 
    // const selectedTheme = 'vscode'; // Podría venir de settings.codeTheme
    // return themeMap[selectedTheme as keyof typeof themeMap] || (isDarkTheme ? vscDarkPlus : vs);
  };
  
  const handleCopy = () => {
    if (onCopy) {
      onCopy(content);
    } else {
      navigator.clipboard.writeText(content);
    }
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className={`code-renderer relative group ${className}`}>
      {/* Header con nombre de archivo y lenguaje */}
      {fileName && (
        <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-t-md border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="font-medium text-sm">{fileName}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-700 rounded-md">
            {detectedLanguage}
          </span>
        </div>
      )}
      
      {/* Código con resaltado de sintaxis */}
      <div className={`${fileName ? 'rounded-b-md' : 'rounded-md'}`}>
        {settings.enableSyntaxHighlighting ? (
          <SyntaxHighlighter
            language={detectedLanguage}
            style={getCodeStyle()}
            showLineNumbers={settings.showLineNumbers}
            wrapLines={true}
            customStyle={{
              margin: '0',
              borderRadius: fileName ? '0 0 0.375rem 0.375rem' : '0.375rem',
              fontSize: '0.875rem',
              padding: '1rem',
              maxHeight: settings.expandCodeBlocks ? 'none' : '400px',
              overflow: 'auto'
            }}
          >
            {content}
          </SyntaxHighlighter>
        ) : (
          <pre className="p-4 bg-gray-100 dark:bg-gray-800 overflow-auto"
               style={{
                 maxHeight: settings.expandCodeBlocks ? 'none' : '400px'
               }}>
            <code className="text-sm font-mono">{content}</code>
          </pre>
        )}
      </div>
      
      {/* Botón para copiar código */}
      <button
        className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
        aria-label="Copiar código"
      >
        {isCopied ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
        )}
      </button>
      
      {/* Botón para expandir/contraer código si es largo */}
      {!settings.expandCodeBlocks && content.split('\n').length > 15 && (
        <button
          className="absolute bottom-2 right-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            // En una implementación real, podríamos modificar settings
            // settings.expandCodeBlocks = !settings.expandCodeBlocks;
          }}
          aria-label="Expandir código"
        >
          Mostrar todo
        </button>
      )}
    </div>
  );
};

export default CodeRenderer;