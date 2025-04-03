import React, { useState, useRef } from 'react';
import { Document } from '../../../shared/types/Document';
import { fileAnalyzerService, FileAnalysisResult } from '../../../services/document/FileAnalyzerService';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import FileImport from './FileImport';

/**
 * Componente de ejemplo que muestra cómo utilizar el sistema moderno de 
 * selección y carga de archivos con análisis integrado.
 */
const FileImportExample: React.FC = () => {
  // Estado para gestionar documentos y análisis
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analysisResults, setAnalysisResults] = useState<FileAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Referencia para componentes anidados
  const fileImportRef = useRef<any>(null);
  
  // Contexto de sostenibilidad
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Manejador para cuando se cargan documentos
  const handleDocumentsLoaded = async (docs: Document[]) => {
    setDocuments(docs);
    setError(null);
    
    // Si no hay documentos, salimos
    if (!docs.length) return;
    
    try {
      setIsAnalyzing(true);
      
      // Analizamos documentos como archivos usando blob
      const files = await Promise.all(docs.map(doc => {
        // Creamos un blob con el contenido del documento
        const blob = new Blob([doc.content], { type: 'text/markdown' });
        // Creamos un objeto File con el blob
        return new File([blob], doc.title + '.md', { 
          type: 'text/markdown',
          lastModified: new Date(doc.updatedAt).getTime()
        });
      }));
      
      // Configuramos el número de operaciones concurrentes según el modo de energía
      const concurrency = currentEnergyMode === 'ultraSaving' ? 1 :
                          currentEnergyMode === 'lowPower' ? 2 :
                          currentEnergyMode === 'standard' ? 4 : 8;
      
      // Analizamos los archivos
      const results = await fileAnalyzerService.analyzeFiles(files, {
        readContent: true,
        detectFormat: true,
        calculateMetrics: true,
        concurrency
      });
      
      setAnalysisResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analizando archivos');
      console.error('Error analyzing files:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Manejador de errores
  const handleError = (err: Error) => {
    setError(err.message);
    console.error('File import error:', err);
  };
  
  return (
    <div className="file-import-example">
      <h2 className="file-import-example__title">Importar archivos Markdown</h2>
      <p className="file-import-example__description">
        Selecciona archivos Markdown para importar y analizar automáticamente.
      </p>
      
      {/* Componente moderno de importación de archivos */}
      <FileImport
        ref={fileImportRef}
        onFilesLoaded={handleDocumentsLoaded}
        onError={handleError}
        enableFolders={true}
        showPreview={true}
        allowedExtensions={['.md', '.markdown']}
        className="file-import-example__import"
      />
      
      {/* Muestra error si existe */}
      {error && (
        <div className="file-import-example__error">
          <p>{error}</p>
        </div>
      )}
      
      {/* Muestra estado de análisis */}
      {isAnalyzing && (
        <div className="file-import-example__analyzing">
          <div className="file-import-example__spinner"></div>
          <p>Analizando archivos...</p>
        </div>
      )}
      
      {/* Muestra los resultados del análisis */}
      {analysisResults.length > 0 && !isAnalyzing && (
        <div className="file-import-example__results">
          <h3>Resultados del análisis ({analysisResults.length} archivos)</h3>
          
          <div className="file-import-example__grid">
            {analysisResults.map((result, index) => (
              <div key={index} className="file-import-example__card">
                <div className="file-import-example__card-header">
                  <h4>{result.name}</h4>
                  <span className="file-import-example__format">
                    {result.markdownFormat}
                  </span>
                </div>
                
                <div className="file-import-example__card-body">
                  <div className="file-import-example__metrics">
                    <div className="file-import-example__metric">
                      <span className="file-import-example__metric-label">Palabras</span>
                      <span className="file-import-example__metric-value">
                        {result.metrics.wordCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="file-import-example__metric">
                      <span className="file-import-example__metric-label">Caracteres</span>
                      <span className="file-import-example__metric-value">
                        {result.metrics.charCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="file-import-example__metric">
                      <span className="file-import-example__metric-label">Líneas</span>
                      <span className="file-import-example__metric-value">
                        {result.metrics.lineCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="file-import-example__metric">
                      <span className="file-import-example__metric-label">Párrafos</span>
                      <span className="file-import-example__metric-value">
                        {result.metrics.paragraphCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {result.tags && result.tags.length > 0 && (
                    <div className="file-import-example__tags">
                      <span className="file-import-example__tags-label">Etiquetas:</span>
                      <div className="file-import-example__tags-list">
                        {result.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="file-import-example__tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.preview && (
                    <div className="file-import-example__preview">
                      <h5>Vista previa:</h5>
                      <p>{result.preview}</p>
                    </div>
                  )}
                </div>
                
                <div className="file-import-example__card-footer">
                  <span className="file-import-example__size">
                    {(result.size / 1024).toFixed(1)} KB
                  </span>
                  <span className="file-import-example__date">
                    {result.lastModified.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileImportExample;