import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from './components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Storage } from './lib/storage';
import './App.css';
import './buttons.css';

interface QRCodeData {
  id: string;
  value: string;
  description: string;
  timestamp: number;
  format: string;
}

// Define the interface for IDetectedBarcode to match the one from @yudiel/react-qr-scanner
interface IDetectedBarcode {
  rawValue: string;
  format: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cornerPoints?: { x: number; y: number }[];
}

// Define the type for barcode formats based on what's expected
type BarcodeFormat = 
  | 'aztec' 
  | 'code_128' 
  | 'code_39' 
  | 'code_93' 
  | 'codabar' 
  | 'databar' 
  | 'databar_expanded' 
  | 'data_matrix' 
  | 'dx_film_edge' 
  | 'ean_13' 
  | 'ean_8' 
  | 'itf' 
  | 'maxi_code' 
  | 'micro_qr_code' 
  | 'pdf417' 
  | 'qr_code' 
  | 'rm_qr_code' 
  | 'upc_a' 
  | 'upc_e' 
  | 'linear_codes' 
  | 'matrix_codes' 
  | 'unknown';

// Array of formats that should use QRCodeSVG
const qrCodeFormats = ['qr_code', 'micro_qr_code', 'rm_qr_code'];

// Array of formats that need special handling for react-barcode
const linearBarcodeFormats = [
  'code_128', 
  'code_39', 
  'code_93', 
  'ean_13', 
  'ean_8', 
  'upc_a', 
  'upc_e',
  'codabar',
  'itf'
];

// Type for react-barcode supported formats directly from react-barcode definition
type BarcodeFormatType = 
  | 'CODE39'
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'EAN5'
  | 'EAN2'
  | 'UPC'
  | 'UPCE'
  | 'ITF14'
  | 'ITF'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'pharmacode'
  | 'codabar'
  | 'GenericBarcode';

// Map formats to react-barcode supported formats
const formatMap: Record<string, BarcodeFormatType> = {
  'code_128': 'CODE128',
  'code_39': 'CODE39',
  'code_93': 'CODE128', // CODE93 is not in react-barcode types, fallback to CODE128
  'ean_13': 'EAN13',
  'ean_8': 'EAN8',
  'upc_a': 'UPC',
  'upc_e': 'UPCE',
  'codabar': 'codabar',
  'itf': 'ITF'
};

export function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  // Load saved QR codes on component mount
  useEffect(() => {
    const savedCodes = Storage.loadQRCodes();
    setQrCodes(savedCodes);
  }, []);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      console.log(detectedCodes);
      const detectedCode = detectedCodes[0];
      const newCode: QRCodeData = {
        id: Date.now().toString(),
        value: detectedCode.rawValue,
        description: '',
        timestamp: Date.now(),
        format: detectedCode.format
      };
      
      const updatedCodes = Storage.addQRCode(newCode);
      setQrCodes(updatedCodes);
      setIsScanning(false);
    }
  };

  const startEditing = (id: string, description: string) => {
    setEditingId(id);
    setEditDescription(description);
  };

  const saveDescription = (id: string) => {
    const updatedCodes = Storage.updateQRCode(id, { description: editDescription });
    setQrCodes(updatedCodes);
    setEditingId(null);
  };

  const deleteCode = (id: string) => {
    const updatedCodes = Storage.deleteQRCode(id);
    setQrCodes(updatedCodes);
  };

  // All supported barcode formats as an array of the specific format type
  const allFormats: BarcodeFormat[] = [
    'aztec',
    'code_128',
    'code_39',
    'code_93',
    'codabar',
    'databar',
    'databar_expanded',
    'data_matrix',
    'dx_film_edge',
    'ean_13',
    'ean_8',
    'itf',
    'maxi_code',
    'micro_qr_code',
    'pdf417',
    'qr_code',
    'rm_qr_code',
    'upc_a',
    'upc_e',
    'linear_codes',
    'matrix_codes'
  ];

  // Render appropriate barcode based on format
  const renderBarcode = (code: QRCodeData) => {
    if (qrCodeFormats.includes(code.format)) {
      return <QRCodeSVG value={code.value} size={140} />;
    } else if (linearBarcodeFormats.includes(code.format)) {
      const format = formatMap[code.format] || 'CODE128';
      return (
        <Barcode
          value={code.value}
          format={format}
          width={1.7}
          height={70}
          displayValue={true}
          margin={0}
        />
      );
    } else {
      // Fallback to CODE128 for unsupported formats
      return (
        <Barcode
          value={code.value}
          format="CODE128"
          width={1.7}
          height={70}
          displayValue={true}
          margin={0}
        />
      );
    }
  };

  return (
    <div className="qr-app">
      <header>
        <h1>Barcode & QR Scanner</h1>
        <div className="header-actions">
          <Button 
            onClick={() => Storage.exportQRCodes()} 
            variant="outline" 
            size="sm"
            disabled={qrCodes.length === 0}
            aria-label="Export saved codes to JSON file"
            className="export-button"
            style={{ backgroundColor: '#f8f8f8', color: '#4285f4', border: '1px solid #ddd' }}
          >
            Export Codes
          </Button>
          <label className="import-button">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      const importedCodes = Storage.importQRCodes(event.target.result as string);
                      setQrCodes(importedCodes);
                    }
                  };
                  reader.readAsText(file);
                  // Reset the file input
                  e.target.value = '';
                }
              }}
              style={{ display: 'none' }}
              aria-label="Import codes from JSON file"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="import-button-element"
              style={{ backgroundColor: '#f8f8f8', color: '#4285f4', border: '1px solid #ddd' }}
            >
              Import Codes
            </Button>
          </label>
        </div>
      </header>
      
      <main>
        {isScanning ? (
          <div className="scanner-container">
            <Scanner 
              onScan={handleScan}
              onError={(error) => console.error(error)}
              formats={allFormats}
            />
            <Button 
              onClick={() => setIsScanning(false)}
              className="close-scanner"
              variant="destructive"
            >
              Close Scanner
            </Button>
          </div>
        ) : (
          <div className="codes-list">
            {qrCodes.length === 0 ? (
              <div className="empty-state">
                <p>No codes saved yet. Click the + button to scan a barcode or QR code.</p>
                <p className="empty-state-help">
                  You can scan QR codes and barcodes, add descriptions, and export your data. 
                  All scans are saved to your browser's storage.
                </p>
              </div>
            ) : (
              qrCodes.map(code => (
                <div key={code.id} className="qr-code-item">
                  <div className="qr-code-content">
                    <div className="qr-code-image">
                      {renderBarcode(code)}
                    </div>
                    <div className="qr-code-details">
                      <div className="qr-code-value">{code.value}</div>
                      <div className="qr-code-format">Format: {code.format || 'Unknown'}</div>
                      
                      {editingId === code.id ? (
                        <div className="edit-description">
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Enter description"
                          />
                          <Button 
                            onClick={() => saveDescription(code.id)}
                            variant="outline"
                            size="sm"
                            className="save-button"
                            style={{ backgroundColor: '#f8f8f8', color: '#4285f4', border: '1px solid #ddd' }}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="qr-code-description">
                          <p>{code.description || 'No description'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="qr-code-bottom-bar">
                    <span className="timestamp">
                      {new Date(code.timestamp).toLocaleString()}
                    </span>
                    <div className="action-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => startEditing(code.id, code.description)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteCode(code.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      
      <Button 
        className="scan-button"
        onClick={() => setIsScanning(true)}
        aria-label="Scan Barcode"
        variant="default"
        size="icon"
      >
        +
      </Button>
    </div>
  );
}

