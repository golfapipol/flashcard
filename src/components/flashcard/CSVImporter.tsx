import React, { useState, useRef, useCallback } from 'react';
import { CSVParser } from '../../lib/csvParser';
import { CSVImportResult } from '../../types/flashcard';
import { LoadingSpinner } from './LoadingContext';

interface CSVImporterProps {
  onImport: (cards: { front: string; back: string }[], fileName: string) => void;
  onError: (error: string) => void;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ onImport, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const result: CSVImportResult = await CSVParser.importFromFile(file);
      
      if (result.success && result.cards) {
        // Extract filename without extension for default deck name
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        onImport(result.cards, fileName);
      } else {
        onError(result.error || 'Failed to import CSV file');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [onImport, onError]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const csvFile = files.find(file => 
      file.type === 'text/csv' || 
      file.type === 'application/csv' || 
      file.name.toLowerCase().endsWith('.csv') ||
      file.name.toLowerCase().endsWith('.txt')
    );
    
    if (csvFile) {
      handleFileSelect(csvFile);
    } else {
      onError('Please drop a CSV file (.csv) or text file (.txt)');
    }
  }, [handleFileSelect, onError]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt,text/csv,application/csv,text/plain"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing}
      />
      
      {/* Drag and drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Processing CSV file...</p>
            <p className="text-xs sm:text-sm text-gray-500">Parsing and validating your flashcard data</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            {/* Upload icon */}
            <svg 
              className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            
            <div className="space-y-1 sm:space-y-2">
              <p className="text-base sm:text-lg font-medium text-gray-700">
                {isDragOver ? 'Drop your CSV file here' : 'Import CSV File'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
                <span className="hidden sm:inline">Drag and drop a CSV file here, or click to select</span>
                <span className="sm:hidden">Tap to select a CSV file</span>
              </p>
              <p className="text-xs text-gray-400">
                Supports .csv and .txt files (max 5MB)
              </p>
            </div>
            
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
              disabled={isProcessing}
            >
              Choose File
            </button>
          </div>
        )}
      </div>
      
      {/* Format help */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Format:</h4>
        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
          <li>• First column: Front of card (question/prompt)</li>
          <li>• Second column: Back of card (answer/explanation)</li>
          <li>• Headers are optional and will be automatically detected</li>
          <li>• Additional columns will be ignored</li>
        </ul>
      </div>
    </div>
  );
};