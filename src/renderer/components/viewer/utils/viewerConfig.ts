import { ContentType } from './contentTypes';

export interface ViewerTheme {
  typography: {
    fontFamily: string;
    headingFamily: string;
    fontSizeFactor: number;
    lineHeight: number;
  };
  colors: {
    background: string;
    text: string;
    headings: string;
    links: string;
    codeBackground: string;
    codeText: string;
    blockquoteBorder: string;
    blockquoteBackground: string;
    tableHeaderBackground: string;
    tableBorder: string;
    tableRowAlt: string;
  };
  spacing: {
    contentPadding: string;
    contentMaxWidth: string;
    blockMargin: string;
    listIndent: string;
  };
}

export interface ViewerSettings {
  theme: ViewerTheme;
  showLineNumbers: boolean;
  enableMermaidDiagrams: boolean;
  enableMathRendering: boolean;
  enableSyntaxHighlighting: boolean;
  enableImagePreview: boolean;
  enableTOC: boolean;
  enableLinks: boolean;
  enableReferenceLinking: boolean;
  enableTaskLists: boolean;
  renderImages: boolean;
  maxImageSize: number; // maximum size in pixels
  expandCodeBlocks: boolean;
  contentTypeOverride?: ContentType;
}

export const defaultLightTheme: ViewerTheme = {
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    headingFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSizeFactor: 1,
    lineHeight: 1.6
  },
  colors: {
    background: '#ffffff',
    text: '#333333',
    headings: '#111111',
    links: '#0366d6',
    codeBackground: '#f6f8fa',
    codeText: '#24292e',
    blockquoteBorder: '#dfe2e5',
    blockquoteBackground: '#f6f8fa',
    tableHeaderBackground: '#f6f8fa',
    tableBorder: '#dfe2e5',
    tableRowAlt: '#f6f8fa'
  },
  spacing: {
    contentPadding: '1.5rem',
    contentMaxWidth: '48rem',
    blockMargin: '1.5rem',
    listIndent: '2rem'
  }
};

export const defaultDarkTheme: ViewerTheme = {
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    headingFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSizeFactor: 1,
    lineHeight: 1.6
  },
  colors: {
    background: '#0d1117',
    text: '#c9d1d9',
    headings: '#e6edf3',
    links: '#58a6ff',
    codeBackground: '#161b22',
    codeText: '#c9d1d9',
    blockquoteBorder: '#30363d',
    blockquoteBackground: '#161b22',
    tableHeaderBackground: '#161b22',
    tableBorder: '#30363d',
    tableRowAlt: '#161b22'
  },
  spacing: {
    contentPadding: '1.5rem',
    contentMaxWidth: '48rem',
    blockMargin: '1.5rem',
    listIndent: '2rem'
  }
};

export const defaultViewerSettings: ViewerSettings = {
  theme: defaultLightTheme,
  showLineNumbers: true,
  enableMermaidDiagrams: true,
  enableMathRendering: true,
  enableSyntaxHighlighting: true,
  enableImagePreview: true,
  enableTOC: true,
  enableLinks: true,
  enableReferenceLinking: true,
  enableTaskLists: true,
  renderImages: true,
  maxImageSize: 800,
  expandCodeBlocks: false
};