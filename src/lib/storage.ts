// Types definition inline to avoid path issues
export interface QRCodeData {
  id: string;
  value: string;
  description: string;
  timestamp: number;
  format: string;
}

// Using the same key as previous implementation for backward compatibility
const STORAGE_KEY = 'qrCodes';

/**
 * Storage utility for QR code data
 */
export const Storage = {
  /**
   * Save QR codes to localStorage
   * @param codes Array of QR code data
   */
  saveQRCodes: (codes: QRCodeData[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving QR codes to localStorage:', error);
    }
  },

  /**
   * Load QR codes from localStorage
   * @returns Array of QR code data or empty array if none found
   */
  loadQRCodes: (): QRCodeData[] => {
    try {
      const storedCodes = localStorage.getItem(STORAGE_KEY);
      return storedCodes ? JSON.parse(storedCodes) : [];
    } catch (error) {
      console.error('Error loading QR codes from localStorage:', error);
      return [];
    }
  },

  /**
   * Add a new QR code to storage
   * @param code New QR code data
   * @returns Updated array of QR codes
   */
  addQRCode: (code: QRCodeData): QRCodeData[] => {
    try {
      const codes = Storage.loadQRCodes();
      const updatedCodes = [code, ...codes];
      Storage.saveQRCodes(updatedCodes);
      return updatedCodes;
    } catch (error) {
      console.error('Error adding QR code to localStorage:', error);
      return [];
    }
  },

  /**
   * Update an existing QR code in storage
   * @param id ID of the QR code to update
   * @param updates Partial QR code data to update
   * @returns Updated array of QR codes
   */
  updateQRCode: (id: string, updates: Partial<QRCodeData>): QRCodeData[] => {
    try {
      const codes = Storage.loadQRCodes();
      const updatedCodes = codes.map(code => 
        code.id === id ? { ...code, ...updates } : code
      );
      Storage.saveQRCodes(updatedCodes);
      return updatedCodes;
    } catch (error) {
      console.error('Error updating QR code in localStorage:', error);
      return [];
    }
  },

  /**
   * Delete a QR code from storage
   * @param id ID of the QR code to delete
   * @returns Updated array of QR codes
   */
  deleteQRCode: (id: string): QRCodeData[] => {
    try {
      const codes = Storage.loadQRCodes();
      const updatedCodes = codes.filter(code => code.id !== id);
      Storage.saveQRCodes(updatedCodes);
      return updatedCodes;
    } catch (error) {
      console.error('Error deleting QR code from localStorage:', error);
      return [];
    }
  },

  /**
   * Clear all QR codes from storage
   */
  clearQRCodes: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing QR codes from localStorage:', error);
    }
  },

  /**
   * Export QR codes as a downloadable JSON file
   */
  exportQRCodes: (): void => {
    try {
      const codes = Storage.loadQRCodes();
      if (codes.length === 0) {
        alert('No QR codes to export');
        return;
      }

      const dataStr = JSON.stringify(codes, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `qrcode-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting QR codes:', error);
      alert('Failed to export QR codes');
    }
  },

  /**
   * Import QR codes from a JSON file
   * @param jsonData JSON data containing an array of QR codes
   * @returns Array of imported QR codes
   */
  importQRCodes: (jsonData: string): QRCodeData[] => {
    try {
      const importedCodes = JSON.parse(jsonData) as QRCodeData[];
      const existingCodes = Storage.loadQRCodes();
      
      // Combine existing codes with imported codes, avoiding duplicates by value
      const existingValues = new Set(existingCodes.map(code => code.value));
      const uniqueImportedCodes = importedCodes.filter(code => !existingValues.has(code.value));
      
      const combinedCodes = [...existingCodes, ...uniqueImportedCodes];
      Storage.saveQRCodes(combinedCodes);
      
      return combinedCodes;
    } catch (error) {
      console.error('Error importing QR codes:', error);
      alert('Failed to import QR codes. Make sure the file format is correct.');
      return Storage.loadQRCodes();
    }
  }
}; 