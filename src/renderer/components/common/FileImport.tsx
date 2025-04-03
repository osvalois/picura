import React, { useRef, useState, useEffect } from 'react';
import { Document } from '../../../shared/types/Document';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import DropZone, { DropZoneRef } from './DropZone';

interface FileImportProps {
  onFilesLoaded?: (documents: Document[]) => void;
  onError?: (error: Error) => void;
  enableFolders?: boolean;
  showPreview?: boolean;
  allowedExtensions?: string[];
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
  position?: 'inline' | 'fixed' | 'absolute' | 'relative';
  style?: React.CSSProperties;
  containerClassName?: string;
}

/**
 * Componente unificado para la importación y carga de archivos
 * Implementa interfaces modernas de selección con retroalimentación visual mejorada
 * y soporte para diferentes posiciones de renderizado
 */
const FileImport: React.FC<FileImportProps> = ({
                                                 onFilesLoaded,
                                                 onError,
                                                 enableFolders = true,
                                                 showPreview = false,
                                                 allowedExtensions = ['.md', '.markdown'],
                                                 maxFileSize = 15 * 1024 * 1024, // 15MB por defecto
                                                 disabled = false,
                                                 className = '',
                                                 position = 'inline',
                                                 style = {},
                                                 containerClassName = ''
                                               }) => {
  // Estado para gestionar la carga y progreso
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Contexto de sostenibilidad para adaptar comportamiento
  const [energyMode, setEnergyMode] = useState<string>('standard');
  
  // Usar un efecto para obtener el modo de energía de manera segura
  useEffect(() => {
    try {
      const { currentEnergyMode } = useSustainabilityContext();
      setEnergyMode(currentEnergyMode);
    } catch (error) {
      console.warn('No se pudo acceder al contexto de sostenibilidad, usando modo estándar');
    }
  }, []);

  // Referencias para los componentes internos
  const dropzoneRef = useRef<DropZoneRef>(null);

  // Manejadores de eventos
  const handleProgress = (progress: number) => {
    setLoadingProgress(progress);
  };

  const handleDocumentsLoaded = (documents: Document[]) => {
    setIsLoading(false);

    if (onFilesLoaded) {
      onFilesLoaded(documents);
    }
  };

  const handleError = (error: Error) => {
    setIsLoading(false);

    if (onError) {
      onError(error);
    }
  };

  const handleFilesDrop = () => {
    setIsLoading(true);
    setLoadingProgress(0);
  };

  // Determinar estilos adicionales para posicionamiento
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles = {...style};

    // Añadir estilos según la posición
    if (position === 'fixed') {
      // Si no se han especificado top/right/bottom/left, establecer valores predeterminados
      if (baseStyles.top === undefined &&
          baseStyles.right === undefined &&
          baseStyles.bottom === undefined &&
          baseStyles.left === undefined) {
        baseStyles.bottom = '1rem';
        baseStyles.right = '1rem';
      }
    }

    return baseStyles;
  };

  // Modo de renderizado adaptativo según el modo de energía
  const renderMode = () => {
    if (energyMode === 'ultraSaving' || energyMode === 'lowPower') {
      // Modo de bajo consumo: interfaz simplificada y animaciones minimizadas
      return (
          <div className={`file-import file-import--simple ${containerClassName}`} style={getContainerStyles()}>
            <div className="file-import__buttons">
              <button
                  type="button"
                  className="file-import__button"
                  onClick={() => dropzoneRef.current?.openFileDialog()}
                  disabled={disabled || isLoading}
              >
                Seleccionar
              </button>

              {enableFolders && (
                  <button
                      type="button"
                      className="file-import__button file-import__button--secondary"
                      onClick={() => dropzoneRef.current?.openFolderDialog()}
                      disabled={disabled || isLoading}
                  >
                    Carpeta
                  </button>
              )}
            </div>

            {isLoading && (
                <div className="file-import__progress">
                  <div className="file-import__progress-bar">
                    <div
                        className="file-import__progress-fill"
                        style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <span className="file-import__progress-text">
                {loadingProgress}%
              </span>
                </div>
            )}
          </div>
      );
    }

    // Modo estándar o alto rendimiento: interfaz completa con DropZone
    return (
        <DropZone
            ref={dropzoneRef}
            onFilesDrop={handleFilesDrop}
            onDocumentsLoaded={handleDocumentsLoaded}
            onProgress={handleProgress}
            onError={handleError}
            className={className}
            accept={allowedExtensions}
            maxSize={maxFileSize}
            disabled={disabled}
            enableFolders={enableFolders}
            showPreview={showPreview}
            autoProcess={true}
            position={position}
            style={getContainerStyles()}
        />
    );
  };

  return renderMode();
};

export default FileImport;