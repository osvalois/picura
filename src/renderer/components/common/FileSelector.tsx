import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useDocumentContext } from '../../contexts/DocumentContext';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';

export interface FileSelectOptions {
  multiple?: boolean;
  folderSelect?: boolean;
  recursive?: boolean;
  preserveStructure?: boolean;
  allowedExtensions?: string[];
  maxFileSize?: number; // en bytes
  onProgress?: (progress: number) => void;
}

export interface FileSelectorRef {
  openFileDialog: () => Promise<void>;
}

interface FileSelectorProps {
  onFilesSelected?: (files: any[]) => void;
  onFolderSelected?: (result: { rootFolder: string; documents: any[]; folders: string[] }) => void;
  onError?: (error: Error) => void;
  options?: FileSelectOptions;
  className?: string;
  children?: React.ReactNode;
  showDropArea?: boolean;
  dropAreaClassName?: string;
  dropAreaActiveClassName?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Componente moderno para selección y carga de archivos
 * Con soporte para arrastar y soltar, selección múltiple, y selección de carpetas
 * Optimizado para rendimiento y accesibilidad
 */
const FileSelector = forwardRef<FileSelectorRef, FileSelectorProps>((props, ref) => {
  const {
    onFilesSelected,
    onFolderSelected,
    onError,
    options = {},
    className = '',
    children,
    showDropArea = false,
    dropAreaClassName = '',
    dropAreaActiveClassName = '',
    label = 'Seleccionar archivos',
    disabled = false
  } = props;

  // Estado local
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Referencias
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  // Hooks de contexto
  const { openFile, openFolder, importFiles, importFolder } = useDocumentContext();
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Configuración de opciones
  const {
    multiple = false,
    folderSelect = false,
    recursive = true,
    preserveStructure = true,
    allowedExtensions = ['.md', '.markdown'],
    maxFileSize = 15 * 1024 * 1024, // 15MB por defecto
    onProgress
  } = options;

  // Actualiza callback de progreso
  const updateProgress = useCallback((progress: number) => {
    setLoadProgress(progress);
    if (onProgress) {
      onProgress(progress);
    }
  }, [onProgress]);

  // Método para abrir diálogo de selección
  const openFileDialog = useCallback(async () => {
    if (disabled || isLoading) return;
    
    try {
      setIsLoading(true);
      updateProgress(0);
      
      if (folderSelect) {
        // Apertura de carpeta
        const result = await openFolder({
          recursive,
          preserveStructure,
          loadProgressCallback: (loaded, total) => {
            const progress = Math.round((loaded / total) * 100);
            updateProgress(progress);
          }
        });
        
        if (result && onFolderSelected) {
          onFolderSelected(result);
        }
      } else {
        // Apertura de archivo(s)
        const result = multiple ? await importFiles() : await openFile();
        
        if (result && onFilesSelected) {
          const files = Array.isArray(result) ? result : [result].filter(Boolean);
          onFilesSelected(files);
        }
      }
      
      updateProgress(100);
    } catch (error) {
      console.error('Error selecting files:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    disabled, isLoading, folderSelect, recursive, preserveStructure,
    openFolder, openFile, importFiles, onFolderSelected, onFilesSelected,
    multiple, onError, updateProgress
  ]);
  
  // Expone métodos al componente padre a través de ref
  useImperativeHandle(ref, () => ({
    openFileDialog
  }));
  
  // Manejadores de eventos para arrastrar y soltar
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isLoading) return;
    
    // Verifica que los archivos arrastrados sean válidos
    const isValidDrag = Array.from(e.dataTransfer.items).some(item => {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        // Acepta carpetas si folderSelect está habilitado
        if (entry?.isDirectory) return folderSelect;
        // Verifica extensiones si es archivo
        if (entry?.isFile && allowedExtensions.length > 0) {
          const fileName = item.getAsFile()?.name || '';
          return allowedExtensions.some(ext => 
            fileName.toLowerCase().endsWith(ext.toLowerCase())
          );
        }
        return true;
      }
      return false;
    });
    
    if (isValidDrag) {
      setIsDragging(true);
    }
  }, [disabled, isLoading, folderSelect, allowedExtensions]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isLoading) return;
    
    // Ajusta el efecto de arrastre según el tipo de selección
    if (folderSelect) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      // Verifica si hay archivos arrastrándose
      const hasFiles = Array.from(e.dataTransfer.items).some(item => 
        item.kind === 'file' && allowedExtensions.some(ext => {
          const file = item.getAsFile();
          return file && file.name.toLowerCase().endsWith(ext.toLowerCase());
        })
      );
      
      e.dataTransfer.dropEffect = hasFiles ? 'copy' : 'none';
    }
  }, [disabled, isLoading, folderSelect, allowedExtensions]);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo desactivamos si el cursor sale completamente del área
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isLoading) return;
    
    // Resetea estado
    setIsDragging(false);
    
    // Obtiene items arrastrados
    const items = Array.from(e.dataTransfer.items);
    
    // Si no hay items, sale
    if (items.length === 0) return;
    
    try {
      setIsLoading(true);
      updateProgress(5); // Indica inicio
      
      // Procesa los archivos o carpetas
      if (folderSelect) {
        // Solo procesamos el primer item como carpeta
        const item = items[0];
        const entry = item.webkitGetAsEntry();
        
        if (entry?.isDirectory) {
          const dirHandle = await (window as any).showDirectoryPicker();
          if (dirHandle) {
            // TODO: Implementar procesamiento del directorio con API moderna de archivos
            // Por ahora usamos la implementación existente
            const result = await importFolder({
              path: entry.name, 
              recursive, 
              preserveStructure
            });
            
            if (result && onFolderSelected) {
              onFolderSelected(result);
            }
          }
        }
      } else {
        // Procesa archivos
        const filePromises = items
          .filter(item => item.kind === 'file')
          .map(item => item.getAsFile())
          .filter(Boolean) as File[];
        
        // Filtra por extensión y tamaño
        const validFiles = filePromises.filter(file => {
          const hasValidExtension = allowedExtensions.length === 0 || 
            allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()));
          
          const hasValidSize = file.size <= maxFileSize;
          
          return hasValidExtension && hasValidSize;
        });
        
        if (validFiles.length > 0) {
          // Si tenemos archivos válidos, los procesamos
          // Esta es una implementación simplificada que usa la API actual
          // TODO: Implementar procesamiento nativo de archivos arrastrables
          
          if (onFilesSelected) {
            onFilesSelected(validFiles);
          }
        }
      }
      
      updateProgress(100);
    } catch (error) {
      console.error('Error processing dropped files:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    disabled, isLoading, folderSelect, recursive, preserveStructure,
    importFolder, onFolderSelected, allowedExtensions, maxFileSize,
    onFilesSelected, onError, updateProgress
  ]);
  
  // Renderiza botón o área para arrastrar y soltar
  return (
    <>
      {/* Botón o trigger personalizado */}
      <div 
        className={`file-selector ${className} ${isLoading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={disabled || isLoading ? undefined : openFileDialog}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-busy={isLoading}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
            e.preventDefault();
            openFileDialog();
          }
        }}
      >
        {children || (
          <button 
            type="button" 
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            className={`file-selector__button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <span className="loading-indicator">
                <span className="loading-spinner"></span>
                Cargando {loadProgress > 0 ? `(${loadProgress}%)` : ''}
              </span>
            ) : (
              <span>
                {folderSelect ? 'Seleccionar carpeta' : label}
              </span>
            )}
          </button>
        )}
      </div>
      
      {/* Área para arrastrar y soltar */}
      {showDropArea && (
        <div 
          ref={dropAreaRef}
          className={`file-selector__drop-area ${dropAreaClassName} ${isDragging ? dropAreaActiveClassName || 'active' : ''} ${disabled ? 'disabled' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="file-selector__drop-content">
            {isDragging ? (
              <div className="file-selector__drop-message">
                <span className="icon">📥</span>
                <p>Soltar {folderSelect ? 'carpeta' : 'archivos'} aquí</p>
              </div>
            ) : (
              <div className="file-selector__drop-prompt">
                <span className="icon">📄</span>
                <p>Arrastra {folderSelect ? 'una carpeta' : 'archivos'} aquí</p>
                <span className="file-selector__drop-secondary">
                  {folderSelect 
                    ? 'o haz clic para seleccionar una carpeta' 
                    : `o haz clic para seleccionar archivo${multiple ? 's' : ''}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

FileSelector.displayName = 'FileSelector';

export default FileSelector;