import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useToast - Shared toast notification hook
 * Returns [toastMessage, showToast] where showToast accepts a message string
 * and an optional duration (default 3500ms)
 */
export function useToast(defaultDuration = 3500) {
  const [toastMessage, setToastMessage] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, duration = defaultDuration) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToastMessage(message);
    timeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      timeoutRef.current = null;
    }, duration);
  }, [defaultDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [toastMessage, showToast];
}

/**
 * useKeyboardShortcuts - Shared keyboard shortcuts hook
 * Supports Cmd/Ctrl+F for search focus and Escape for closing modals
 */
export function useKeyboardShortcuts({ findInputRef, onEscape, onFind }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key - close modals
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Cmd/Ctrl + F - focus search input
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        if (findInputRef?.current) {
          findInputRef.current.focus();
        }
        onFind?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [findInputRef, onEscape, onFind]);
}

/**
 * useCopyFeedback - Shared copy-to-clipboard hook with visual feedback
 * Returns [copyText, handleCopy]
 * @param {string} defaultText - Label for the copy button
 * @param {number} feedbackDuration - How long "Tersalin!" is shown (ms)
 */
export function useCopyFeedback(defaultText = 'Salin', feedbackDuration = 1800) {
  const [copyText, setCopyText] = useState(defaultText);
  const timerRef = useRef(null);

  const handleCopy = useCallback(async (textToCopy) => {
    try {
      if (
        !navigator.clipboard ||
        (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost')
      ) {
        // Fallback untuk non-HTTPS: gunakan execCommand (deprecated tapi masih jalan)
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopyText('Tersalin!');
    } catch (err) {
      console.error('Gagal menyalin:', err);
      setCopyText('Gagal');
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyText(defaultText), feedbackDuration);
  }, [defaultText, feedbackDuration]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [copyText, handleCopy];
}
