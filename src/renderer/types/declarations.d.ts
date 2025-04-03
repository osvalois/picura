// Type declarations for modules without type definitions

declare module 'react-markdown' {
  import React from 'react';
  
  export interface ReactMarkdownProps {
    children: string;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    components?: Record<string, React.ComponentType<any>>;
    className?: string;
    skipHtml?: boolean;
    transformLinkUri?: (uri: string) => string;
  }
  
  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}

declare module 'remark-math' {
  const remarkMath: any;
  export default remarkMath;
}

declare module 'rehype-katex' {
  const rehypeKatex: any;
  export default rehypeKatex;
}

declare module 'react-syntax-highlighter' {
  import { CSSProperties, ReactNode } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: ReactNode;
    customStyle?: CSSProperties;
    lineProps?: any;
    wrapLines?: boolean;
    showLineNumbers?: boolean;
    lineNumberStyle?: CSSProperties;
  }
  
  export const Prism: React.ComponentType<SyntaxHighlighterProps>;
  export const Light: React.ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const vscDarkPlus: any;
  export const vs: any;
  export const materialDark: any;
  export const materialLight: any;
  export const duotoneLight: any;
  export const duotoneDark: any;
  export const okaidia: any;
  export const solarizedlight: any;
}

declare module 'mermaid' {
  interface MermaidAPI {
    initialize: (config: any) => void;
    render: (id: string, text: string, callback: (svgCode: string) => void) => void;
    init: (config: any, selector: string, callback: (svgCode: string) => void) => void;
  }
  
  const mermaid: MermaidAPI;
  export default mermaid;
}