/**
 * Re-export kanonik.
 *
 * Implementasi hook toast/copy sebelumnya terduplikasi di
 * `src/hooks/useToast.js` dan `src/features/hooks/useToast.js` dengan API
 * yang berbeda (array vs object), sehingga pemanggil seperti
 * `features/admin/JejakAudit.jsx` sempat crash. Sekarang satu sumber
 * kebenaran ada di `features/hooks/useToast.js`.
 */
export { useToast, useKeyboardShortcuts, useCopyFeedback } from '../features/hooks/useToast';
