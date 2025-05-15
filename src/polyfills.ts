// Import the Buffer implementation
import { Buffer as BufferPolyfill } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  (window as any).Buffer = window.Buffer || BufferPolyfill;
}

export {}; 