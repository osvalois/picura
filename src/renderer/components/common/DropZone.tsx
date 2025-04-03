import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useFileLoader } from '../../hooks/useFileLoader';
import { Document } from '../../../shared/types/Document';

export interface DropZoneProps {
  onFilesDrop?: (files: File[]) => void;
  onDocumentsLoaded?: (documents: Document[]) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  className?: string;
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  enableFolders?: boolean;
  autoProcess?: boolean;
}

export interface DropZoneRef {
  openFileDialog: () => Promise<void>;
  openFolderDialog: () => Promise<void>;
  resetState: () => void;
}

/**
 * Componente adaptado para Picura MD que permite seleccionar archivos
 */
const DropZone = forwardRef<DropZoneRef, DropZoneProps>((props, ref) => {
  const {
    onFilesDrop,
    onDocumentsLoaded,
    onProgress,
    onError,
    className = '',
    accept = ['.md', '.markdown'],
    multiple = true,
    maxSize = 15 * 1024 * 1024, // 15MB
    disabled = false,
    enableFolders = true,
    autoProcess = true
  } = props;

  // Estados locales
  const [isDragActive, setIsDragActive] = useState(false);

  // Referencias
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  // Hook personalizado para gestión de carga de archivos
  const fileLoader = useFileLoader({
    onLoadStart: () => {},
    onLoadProgress: (progress) => {
      if (onProgress) {
        onProgress(progress);
      }
    },
    onLoadComplete: (documents) => {
      if (onDocumentsLoaded) {
        onDocumentsLoaded(documents);
      }
    },
    onLoadError: (error) => {
      if (onError) {
        onError(error);
      }
    },
    adaptToEnergyMode: true
  });

  // Validación de archivos
  const isValidFile = useCallback((file: File): boolean => {
    // Validación de tamaño
    if (maxSize > 0 && file.size > maxSize) {
      return false;
    }

    // Validación de tipo
    if (accept.length > 0) {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      return accept.some(ext => {
        if (ext.startsWith('.')) {
          return ext.toLowerCase() === fileExt;
        } else if (ext.includes('/')) {
          return file.type === ext || file.type.startsWith(ext.split('/')[0] + '/');
        }
        return false;
      });
    }

    return true;
  }, [accept, maxSize]);

  // Procesar archivos arrastrados
  const processDroppedItems = useCallback(async (items: DataTransferItemList) => {
    if (disabled || !items.length) return;

    // Arreglos para almacenar archivos aceptados
    const acceptedFiles: File[] = [];

    // Función recursiva para procesar entradas de directorio
    const processEntry = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        // Es un archivo, lo procesamos directamente
        const fileEntry = entry as FileSystemFileEntry;

        return new Promise<void>((resolve) => {
          fileEntry.file((file) => {
            if (isValidFile(file)) {
              acceptedFiles.push(file);
            }
            resolve();
          }, () => {
            // Error al leer el archivo
            resolve();
          });
        });
      } else if (enableFolders && entry.isDirectory) {
        // Es un directorio, procesamos su contenido
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();

        return new Promise<void>((resolve) => {
          const readEntries = () => {
            dirReader.readEntries(async (entries) => {
              if (entries.length > 0) {
                // Procesamos cada entrada recursivamente
                await Promise.all(entries.map(processEntry));
                // Seguimos leyendo (readEntries puede devolver resultados parciales)
                readEntries();
              } else {
                // Terminamos con este directorio
                resolve();
              }
            }, () => {
              // Error al leer el directorio
              resolve();
            });
          };

          readEntries();
        });
      }

      return Promise.resolve();
    };

    // Procesamos todos los items
    const itemsArray = Array.from(items);
    const entries = itemsArray
        .filter(item => item.kind === 'file')
        .map(item => item.webkitGetAsEntry())
        .filter(Boolean) as FileSystemEntry[];

    // Si hay entradas, las procesamos
    if (entries.length > 0) {
      await Promise.all(entries.map(processEntry));

      // Limitamos si no es múltiple
      if (!multiple && acceptedFiles.length > 0) {
        acceptedFiles.splice(1); // Elimina todos excepto el primero
      }

      // Notificamos archivos aceptados
      if (acceptedFiles.length > 0) {
        if (onFilesDrop) {
          onFilesDrop(acceptedFiles);
        }

        if (autoProcess) {
          fileLoader.selectFiles(acceptedFiles);
          await fileLoader.loadFiles(acceptedFiles);
        }
      }
    }
  }, [
    disabled, isValidFile, enableFolders, multiple, onFilesDrop,
    autoProcess, fileLoader
  ]);

  // Manejadores de eventos para arrastrar y soltar
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    dragCounterRef.current++;

    // Solo activamos si hay archivos siendo arrastrados
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    // Establece el efecto de arrastre según configuración
    e.dataTransfer.dropEffect = 'copy';
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;

    // Solo desactivamos si ya no hay arrastres activos
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current = 0;
    setIsDragActive(false);

    if (disabled) return;

    await processDroppedItems(e.dataTransfer.items);
  }, [disabled, processDroppedItems]);

  // Abre diálogo de selección de archivos
  const openFileDialog = useCallback(async () => {
    if (disabled || fileLoader.isLoading) return;

    try {
      await fileLoader.openFileDialog();
    } catch (error) {
      console.error('Error opening file dialog:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [disabled, fileLoader, onError]);

  // Abre diálogo de selección de carpetas
  const openFolderDialog = useCallback(async () => {
    if (disabled || fileLoader.isLoading || !enableFolders) return;

    try {
      await fileLoader.openFolderDialog();
    } catch (error) {
      console.error('Error opening folder dialog:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [disabled, fileLoader, enableFolders, onError]);

  // Resetea el estado
  const resetState = useCallback(() => {
    fileLoader.resetState();
  }, [fileLoader]);

  // Expone métodos al componente padre
  useImperativeHandle(ref, () => ({
    openFileDialog,
    openFolderDialog,
    resetState
  }));

  // Clases CSS
  const dropzoneClasses = [
    'picura-dropzone',
    className,
    isDragActive ? 'picura-dropzone--active' : '',
    disabled ? 'picura-dropzone--disabled' : '',
    fileLoader.isLoading ? 'picura-dropzone--loading' : ''
  ].filter(Boolean).join(' ');

  // Formatos aceptados en forma concisa
  const formatosTexto = accept.join(', ');

  return (
      <div className="picura-dropzone-wrapper">
        <div
            ref={dropZoneRef}
            className={dropzoneClasses}
            onClick={disabled ? undefined : openFileDialog}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-busy={fileLoader.isLoading}
            title="Arrastrar o seleccionar archivos"
        >
          {fileLoader.isLoading ? (
              <div className="picura-dropzone__loading">
                <svg className="picura-dropzone__spinner" viewBox="0 0 24 24">
                  <circle className="picura-dropzone__spinner-circle" cx="6" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"></circle>
                </svg>
              </div>
          ) : (
              <>
                <div className="picura-dropzone__text">
                  <span>Subir {formatosTexto}</span>
                </div>
              </>
          )}
        </div>
      </div>
  );
});

DropZone.displayName = 'DropZone';

export default DropZone;