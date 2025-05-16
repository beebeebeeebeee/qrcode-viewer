import { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from './components/ui/button';
import { Storage } from './lib/storage';
import { QRCodeCard } from './components/QRCodeCard';
import { QRCodeData, IDetectedBarcode, BarcodeFormat } from './types';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { BarcodeRenderer } from './components/BarcodeRenderer';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from './components/ui/dialog';

// Create simple UI components inline since the imports are causing issues
const Label = ({ htmlFor, className, children }: { htmlFor?: string, className?: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className={className}>{children}</label>
);

const Input = ({ 
  id, 
  value, 
  onChange, 
  className, 
  placeholder 
}: { 
  id?: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  className?: string, 
  placeholder?: string 
}) => (
  <input 
    id={id} 
    value={value} 
    onChange={onChange} 
    className={className} 
    placeholder={placeholder} 
  />
);

const Select = ({ 
  value, 
  onValueChange, 
  children 
}: { 
  value: string, 
  onValueChange: (value: string) => void, 
  children: React.ReactNode 
}) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange(e.target.value)}
    className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
  >
    {children}
  </select>
);

const SelectItem = ({ value, key, children }: { value: string, key: string, children: React.ReactNode }) => (
  <option value={value} key={key}>{children}</option>
);

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

export function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [manualFormat, setManualFormat] = useState<BarcodeFormat>('qr_code');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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

  // Handle file import with validation and error handling
  const handleImport = (file: File) => {
    setIsImporting(true);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const fileContent = event.target.result as string;
        
        // Basic validation - check if it's valid JSON
        let parsedData;
        try {
          parsedData = JSON.parse(fileContent);
        } catch {
          throw new Error('Invalid JSON file format');
        }
        
        // Check if it's an array
        if (!Array.isArray(parsedData)) {
          throw new Error('Invalid data format: Expected an array of codes');
        }
        
        // Validate data structure
        const invalidEntries = parsedData.filter(
          (item) => !item.id || !item.value || typeof item.timestamp !== 'number'
        );
        
        if (invalidEntries.length > 0) {
          throw new Error('Some entries in the file have an invalid format');
        }
        
        // Import the codes
        const importedCodes = Storage.importQRCodes(fileContent);
        setQrCodes(importedCodes);
        
        const newCodesCount = importedCodes.length - qrCodes.length;
        if (newCodesCount > 0) {
          toast({
            title: "Import Successful",
            description: `Added ${newCodesCount} new codes to your collection.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Import Complete",
            description: "No new codes were added. All codes already exist in your collection.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Failed to read the file",
        variant: "destructive",
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  // Function to trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleManualAdd = () => {
    if (!manualValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }

    const newCode: QRCodeData = {
      id: Date.now().toString(),
      value: manualValue.trim(),
      description: '',
      timestamp: Date.now(),
      format: manualFormat
    };
    
    const updatedCodes = Storage.addQRCode(newCode);
    setQrCodes(updatedCodes);
    setShowManualEntry(false);
    setManualValue('');
    setManualFormat('qr_code');
    
    toast({
      title: "Code Added",
      description: "Your code has been saved",
      variant: "default",
    });
  };

  return (
    <div className="mx-auto px-4 py-8 w-full max-w-[100vw] overflow-hidden min-h-screen relative">
      <Toaster />
      <header className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">QR Code Saver</h2>
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
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImport(file);
                // Reset the file input
                e.target.value = '';
              }
            }}
            className="hidden"
            aria-label="Import codes from JSON file"
            disabled={isImporting}
          />
          <Button 
            variant="outline" 
            size="sm"
            disabled={isImporting}
            onClick={handleImportClick}
          >
            {isImporting ? 'Importing...' : 'Import Codes'}
          </Button>
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
                  renderBarcode={(code, qrSize, linearWidth, linearHeight) => (
                    <BarcodeRenderer 
                      code={code} 
                      qrSize={qrSize}
                      linearWidth={linearWidth}
                      linearHeight={linearHeight}
                    />
                  )}
                  qrSize={120}
                  linearWidth={1.5}
                  linearHeight={60}
                />
              ))
            )}
          </div>
        )}
      </main>
      
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <div className="group relative">
          <Button 
            className="w-14 h-14 rounded-full text-2xl shadow-lg hover:scale-110 relative"
            onClick={() => setIsScanning(true)}
            aria-label="Scan Barcode"
            variant="default"
            ref={addButtonRef}
          >
            +
          </Button>
          
          <Button
            className="absolute right-0 -translate-y-full -translate-x-1/2 top-0 mb-2 w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-500 hover:bg-blue-600"
            onClick={() => setShowManualEntry(true)}
            aria-label="Manually Add Code"
            variant="default"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Code Manually</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right col-span-1">
                Value
              </Label>
              <Input
                id="value"
                value={manualValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualValue(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Enter code value"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right col-span-1">
                Format
              </Label>
              <Select
                value={manualFormat}
                onValueChange={(value: string) => setManualFormat(value as BarcodeFormat)}
              >
                {allFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format.replace('_', ' ')}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowManualEntry(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleManualAdd}>
                Add
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

