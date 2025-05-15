export type QRCodeData = {
  id: string;
  value: string;
  description: string;
  timestamp: number;
  format: string;
}

// Define the interface for IDetectedBarcode to match the one from @yudiel/react-qr-scanner
export type IDetectedBarcode = {
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
export type BarcodeFormat = 
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

// Type for react-barcode supported formats directly from react-barcode definition
export type BarcodeFormatType = 
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