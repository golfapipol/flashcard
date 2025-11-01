import React, { useState, useEffect } from 'react';
import { DECK_COLORS, DeckColor } from '../../types/flashcard';

interface DeckCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeck: (name: string, color: string) => void;
  defaultName?: string;
  cardCount?: number;
}

export const DeckCreationDialog: React.FC<DeckCreationDialogProps> = ({
  isOpen,
  onClose,
  onCreateDeck,
  defaultName = '',
  cardCount = 0
}) => {
  const [deckName, setDeckName] = useState(defaultName);
  const [selectedColor, setSelectedColor] = useState<DeckColor>(DECK_COLORS[0]);
  const [nameError, setNameError] = useState('');

  // Reset form when dialog opens/closes or defaultName changes
  useEffect(() => {
    if (isOpen) {
      setDeckName(defaultName);
      setSelectedColor(DECK_COLORS[0]);
      setNameError('');
    }
  }, [isOpen, defaultName]);

  const validateName = (name: string): boolean => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setNameError('Deck name is required');
      return false;
    }
    
    if (trimmedName.length < 2) {
      setNameError('Deck name must be at least 2 characters long');
      return false;
    }
    
    if (trimmedName.length > 50) {
      setNameError('Deck name must be less than 50 characters');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setDeckName(newName);
    
    // Clear error when user starts typing
    if (nameError && newName.trim()) {
      setNameError('');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateName(deckName)) {
      onCreateDeck(deckName.trim(), selectedColor);
      onClose();
    }
  };

  const handleCancel = () => {
    setDeckName('');
    setSelectedColor(DECK_COLORS[0]);
    setNameError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Deck</h2>
          {cardCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Ready to import {cardCount} flashcard{cardCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Deck Name Input */}
          <div className="mb-6">
            <label htmlFor="deckName" className="block text-sm font-medium text-gray-700 mb-2">
              Deck Name
            </label>
            <input
              id="deckName"
              type="text"
              value={deckName}
              onChange={handleNameChange}
              placeholder="Enter deck name..."
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${nameError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
                }
              `}
              autoFocus
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Deck Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {DECK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-full h-12 rounded-md border-2 transition-all duration-200
                    ${selectedColor === color 
                      ? 'border-gray-800 scale-105 shadow-md' 
                      : 'border-gray-200 hover:border-gray-400 hover:scale-102'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                >
                  {selectedColor === color && (
                    <svg 
                      className="w-6 h-6 text-white mx-auto drop-shadow-sm" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Choose a color to help identify your deck
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div 
              className="p-4 rounded-md border-2 border-dashed border-gray-200"
              style={{ backgroundColor: `${selectedColor}15` }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="font-medium text-gray-900">
                  {deckName.trim() || 'Deck Name'}
                </span>
                {cardCount > 0 && (
                  <span className="text-sm text-gray-600">
                    ({cardCount} card{cardCount !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!deckName.trim() || !!nameError}
            className={`
              px-4 py-2 rounded-md transition-colors
              ${!deckName.trim() || !!nameError
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            Create Deck
          </button>
        </div>
      </div>
    </div>
  );
};