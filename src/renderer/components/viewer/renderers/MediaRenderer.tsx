import React, { useState } from 'react';
import { ViewerSettings } from '../utils/viewerConfig';

interface MediaRendererProps {
  url: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'unknown';
  alt?: string;
  settings: ViewerSettings;
  onImageClick?: ((event: React.MouseEvent<HTMLImageElement>) => void) | undefined;
  className?: string;
}

/**
 * Componente para renderizar diferentes tipos de medios
 */
const MediaRenderer: React.FC<MediaRendererProps> = ({
  url,
  type,
  alt = 'Media content',
  settings,
  onImageClick,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Manejadores de eventos
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setError(`No se pudo cargar el contenido desde: ${url}`);
  };
  
  // Renderiza el contenido según su tipo
  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={url}
            alt={alt}
            className="max-w-full h-auto rounded-md cursor-zoom-in"
            style={{
              maxHeight: `${settings.maxImageSize}px`
            }}
            onLoad={handleLoad}
            onError={handleError}
            onClick={onImageClick}
          />
        );
        
      case 'video':
        return (
          <video
            src={url}
            controls
            className="max-w-full rounded-md"
            style={{
              maxHeight: `${settings.maxImageSize}px`
            }}
            onLoadedData={handleLoad}
            onError={handleError}
          >
            Your browser does not support video playback.
          </video>
        );
        
      case 'audio':
        return (
          <audio
            src={url}
            controls
            className="w-full"
            onLoadedData={handleLoad}
            onError={handleError}
          >
            Your browser does not support audio playback.
          </audio>
        );
        
      case 'pdf':
        return (
          <div className="pdf-container w-full h-96 border border-gray-300 dark:border-gray-700 rounded-md">
            <iframe
              src={`${url}#view=FitH`}
              className="w-full h-full"
              onLoad={handleLoad}
              onError={handleError}
              title="PDF Document"
            />
          </div>
        );
        
      case 'unknown':
      default:
        return (
          <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {url.split('/').pop() || 'Abrir archivo'}
            </a>
          </div>
        );
    }
  };
  
  return (
    <div className={`media-renderer ${className}`}>
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-md">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Abrir en una nueva pestaña
          </a>
        </div>
      ) : (
        <div className="media-content">{renderContent()}</div>
      )}
    </div>
  );
};

export default MediaRenderer;