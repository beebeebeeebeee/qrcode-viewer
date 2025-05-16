import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { QRCodeData, BarcodeFormatType } from '../types';

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

interface BarcodeRendererProps {
  code: QRCodeData;
  qrSize?: number;
  linearWidth?: number;
  linearHeight?: number;
}

export const BarcodeRenderer = ({
  code,
  qrSize = 140,
  linearWidth = 1.7,
  linearHeight = 70
}: BarcodeRendererProps) => {
  if (qrCodeFormats.includes(code.format)) {
    return <QRCodeSVG value={code.value} size={qrSize} />;
  } else if (linearBarcodeFormats.includes(code.format)) {
    const format = formatMap[code.format] || 'CODE128';
    return (
      <Barcode
        value={code.value}
        format={format}
        width={linearWidth}
        height={linearHeight}
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
        width={linearWidth}
        height={linearHeight}
        displayValue={true}
        margin={0}
      />
    );
  }
}; 