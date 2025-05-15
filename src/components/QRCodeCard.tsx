import React from 'react';
import { Button } from './ui/button';
import { QRCodeData } from '../types';
import { ValueDisplay } from './ValueDisplay';

interface QRCodeCardProps {
  code: QRCodeData;
  onEdit: (id: string, description: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  isEditing: boolean;
  editDescription: string;
  setEditDescription: (description: string) => void;
  renderBarcode: (code: QRCodeData) => React.ReactNode;
}

export function QRCodeCard({
  code,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  isEditing,
  editDescription,
  setEditDescription,
  renderBarcode
}: QRCodeCardProps) {
  return (
    <div className="flex flex-col border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden max-w-full">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
        <div className="flex-none w-36 flex justify-center items-center overflow-hidden">
          {renderBarcode(code)}
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Description first (swapped with value) */}
          {isEditing ? (
            <div className="flex flex-col gap-3 mt-1 w-full">
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          ) : (
            <div className="flex justify-between items-start mb-2">
              <p className="text-base text-gray-700 pr-3 break-words font-medium max-w-full">
                {code.description || 'No description'}
              </p>
            </div>
          )}
          
          {/* Value section with ValueDisplay component */}
          <div className="w-full mb-2 overflow-hidden">
            <ValueDisplay value={code.value} />
          </div>
          <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block mb-2">
            Format: {code.format || 'Unknown'}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center border-t border-gray-100 mt-2 pt-3">
        <span className="text-xs text-gray-500">
          {new Date(code.timestamp).toLocaleString()}
        </span>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => onSave(code.id)}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => onEdit(code.id, code.description)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => onDelete(code.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 