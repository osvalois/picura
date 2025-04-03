import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../../../utils/performanceUtils';
import { Document } from '../../../../shared/types/Document';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';
import { countWords } from '../utils/textUtils';
import { autosaveIntervals } from '../utils/documentUtils';

interface UseEditorManagerProps {
  document: Document | null;
  initialContent: string;
  readOnly: boolean;
  autoSave: boolean;
  currentEnergyMode: EnergyMode;
  onSave: (isAutoSave?: boolean) => Promise<void>;
}

interface UseEditorManagerResult {
  content: string;
  wordCount: number;
  isSaving: boolean;
  saveStatus: 'idle' | 'pending' | 'success' | 'error';
  selectionStats: {
    characters: number;
    words: number;
    lines: number;
  };
  showSaveNotification: boolean;
  handleContentChange: (newContent: string) => void;
  handleSave: (isAutoSave?: boolean) => Promise<void>;
  handleSelectionChange: (stats: { characters: number; words: number; lines: number; }) => void;
}

/**
 * Hook para gestionar el contenido del editor, incluyendo cambios, guardado y selección
 */
export function useEditorManager({
  document,
  initialContent,
  readOnly,
  autoSave,
  currentEnergyMode,
  onSave
}: UseEditorManagerProps): UseEditorManagerResult {
  // Estado local
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [selectionStats, setSelectionStats] = useState({
    characters: 0,
    words: 0,
    lines: 0
  });
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Referencias para gestionar autosave y cambios pendientes
  const contentRef = useRef(content);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const pendingChangesRef = useRef<boolean>(false);

  // Actualiza la referencia del contenido cuando cambia
  useEffect(() => {
    if (contentRef.current !== content) {
      contentRef.current = content;
      
      // Marca cambios pendientes si el contenido difiere del documento original
      if (document && content !== document.content) {
        pendingChangesRef.current = true;
      }
    }
  }, [content, document]);

  // Conteo optimizado de palabras con debounce adaptativo
  const updateWordCount = useCallback(
    debounce((text: string) => {
      // Para documentos muy grandes, usamos estimación inicialmente
      if (text.length > 500000 && currentEnergyMode !== 'highPerformance') {
        const estimatedCount = Math.round(text.length / 5.5);
        setWordCount(estimatedCount);

        // Posponemos cálculo exacto para momento inactivo
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            const exactCount = countWords(text);
            setWordCount(exactCount);
          }, { timeout: 2000 });
        } else {
          setTimeout(() => {
            const exactCount = countWords(text);
            setWordCount(exactCount);
          }, 2000);
        }
      } else {
        // Para documentos normales, calculamos inmediatamente
        const count = countWords(text);
        setWordCount(count);
      }
    }, currentEnergyMode === 'ultraSaving' ? 1000 :
      currentEnergyMode === 'lowPower' ? 500 : 300),
    [currentEnergyMode]
  );

  // Manejador de cambios de contenido
  const handleContentChange = useCallback((newContent: string) => {
    // Evitamos actualizaciones innecesarias si no hay cambio real
    if (newContent !== contentRef.current) {
      setContent(newContent);
      pendingChangesRef.current = true;
      updateWordCount(newContent);
    }
  }, [updateWordCount]);

  // Manejador de guardado
  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!document?.id || readOnly) return;

    try {
      // Actualizamos UI solo para guardado manual
      if (!isAutoSave) {
        setIsSaving(true);
        setSaveStatus('pending');
      }

      // Registramos tiempo de guardado
      lastSaveTimeRef.current = Date.now();
      
      // Llamamos a la función de guardado externa
      await onSave(isAutoSave);
      
      // Actualizamos estado tras guardado exitoso
      if (!isAutoSave) {
        setSaveStatus('success');
        // Muestra notificación brevemente
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 2000);
      }
      
      // Resetea indicador de cambios pendientes
      pendingChangesRef.current = false;
    } catch (error) {
      console.error('Error saving document:', error);
      
      if (!isAutoSave) {
        setSaveStatus('error');
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
        // Vuelve a estado inactivo después de un tiempo
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  }, [document?.id, readOnly, onSave]);

  // Manejador de cambios en la selección
  const handleSelectionChange = useCallback((stats: {
    characters: number;
    words: number;
    lines: number;
  }) => {
    setSelectionStats(stats);
  }, []);

  // Configura autosave
  useEffect(() => {
    // Limpia timeout existente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Solo configura si autosave está habilitado
    if (!autoSave || readOnly) return;

    const interval = autosaveIntervals[currentEnergyMode] || autosaveIntervals.standard;

    // Configura timeout recursivo para guardar periódicamente
    const setupSaveTimeout = () => {
      saveTimeoutRef.current = setTimeout(() => {
        // Solo guarda si hay cambios pendientes y pasó el tiempo mínimo
        const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
        if (document?.id && pendingChangesRef.current && timeSinceLastSave >= interval) {
          handleSave(true);
        }
        setupSaveTimeout();
      }, interval);
    };

    setupSaveTimeout();

    // Limpia en desmontaje
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document?.id, currentEnergyMode, autoSave, readOnly, handleSave]);

  // Calcula el conteo de palabras inicial una vez
  useEffect(() => {
    if (initialContent) {
      updateWordCount(initialContent);
    }
  }, [initialContent, updateWordCount]);

  return {
    content,
    wordCount,
    isSaving,
    saveStatus,
    selectionStats,
    showSaveNotification,
    handleContentChange,
    handleSave,
    handleSelectionChange
  };
}