import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from './components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Storage } from './lib/storage';
import { QRCodeCard } from './components/QRCodeCard';
import { QRCodeData, IDetectedBarcode, BarcodeFormat, BarcodeFormatType } from './types';
import { Toaster } from './components/ui/toaster';

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

  const cancelEditing = () => {
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
    <div className="mx-auto px-4 py-8 w-full max-w-[100vw] overflow-hidden min-h-screen relative">
      <Toaster />
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Barcode & QR Scanner</h1>
        <div className="flex justify-center gap-4 mb-5">
          <Button 
            onClick={() => Storage.exportQRCodes()} 
            variant="outline" 
            size="sm"
            disabled={qrCodes.length === 0}
            aria-label="Export saved codes to JSON file"
          >
            Export Codes
          </Button>
          <label className="cursor-pointer">
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
              className="hidden"
              aria-label="Import codes from JSON file"
            />
            <Button 
              variant="outline" 
              size="sm" 
            >
              Import Codes
            </Button>
          </label>
        </div>
      </header>
      
      <main>
        {isScanning ? (
          <div className="relative max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg">
            <Scanner 
              onScan={handleScan}
              onError={(error) => console.error(error)}
              formats={allFormats}
            />
            <Button 
              onClick={() => setIsScanning(false)}
              className="absolute top-4 right-4 z-10"
              variant="destructive"
            >
              Close Scanner
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-20 max-w-3xl w-full mx-auto">
            {qrCodes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No codes saved yet. Click the + button to scan a barcode or QR code.</p>
                <p className="text-sm mt-3 text-gray-500 max-w-md mx-auto">
                  You can scan QR codes and barcodes, add descriptions, and export your data. 
                  All scans are saved to your browser's storage.
                </p>
              </div>
            ) : (
              qrCodes.map(code => (
                <QRCodeCard
                  key={code.id}
                  code={code}
                  onEdit={startEditing}
                  onDelete={deleteCode}
                  onSave={saveDescription}
                  onCancel={cancelEditing}
                  isEditing={editingId === code.id}
                  editDescription={editDescription}
                  setEditDescription={setEditDescription}
                  renderBarcode={renderBarcode}
                />
              ))
            )}
          </div>
        )}
      </main>
      
      <Button 
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-2xl shadow-lg hover:scale-110"
        onClick={() => setIsScanning(true)}
        aria-label="Scan Barcode"
        variant="default"
      >
        +
      </Button>
    </div>
  );
}

