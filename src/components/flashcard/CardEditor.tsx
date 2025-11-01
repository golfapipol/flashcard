import React, { useState, useEffect } from 'react';

interface CardData {
  front: string;
  back: string;
}

interface CardEditorProps {
  card?: CardData;
  onSave: (card: CardData) => void;
  onCancel: () => void;
  isEditing?: boolean;
  deckName?: string;
  deckColor?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  onSave,
  onCancel,
  isEditing = false,
  deckName = 'Preview Deck',
  deckColor = '#3B82F6'
}) => {
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [frontError, setFrontError] = useState('');
  const [backError, setBackError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewFlipped, setPreviewFlipped] = useState(false);

  // Reset form when card prop changes
  useEffect(() => {
    setFront(card?.front || '');
    setBack(card?.back || '');
    setFrontError('');
    setBackError('');
    setShowPreview(false);
    setPreviewFlipped(false);
  }, [card]);

  const validateFront = (value: string): boolean => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setFrontError('Front content is required');
      return false;
    }
    
    if (trimmedValue.length > 500) {
      setFrontError('Front content must be less than 500 characters');
      return false;
    }
    
    setFrontError('');
    return true;
  };

  const validateBack = (value: string): boolean => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setBackError('Back content is required');
      return false;
    }
    
    if (trimmedValue.length > 500) {
      setBackError('Back content must be less than 500 characters');
      return false;
    }
    
    setBackError('');
    return true;
  };

  const handleFrontChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setFront(newValue);
    
    // Clear error when user starts typing
    if (frontError && newValue.trim()) {
      setFrontError('');
    }
  };

  const handleBackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setBack(newValue);
    
    // Clear error when user starts typing
    if (backError && newValue.trim()) {
      setBackError('');
    }
  };

  const handleSave = () => {
    const isFrontValid = validateFront(front);
    const isBackValid = validateBack(back);
    
    if (isFrontValid && isBackValid) {
      onSave({
        front: front.trim(),
        back: back.trim()
      });
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    setPreviewFlipped(false);
  };

  const handlePreviewFlip = () => {
    setPreviewFlipped(!previewFlipped);
  };

  const isFormValid = front.trim() && back.trim() && !frontError && !backError;

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Front Content */}
        <div>
          <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
            Front Content
          </label>
          <textarea
            id="front"
            value={front}
            onChange={handleFrontChange}
            placeholder="Enter the question or prompt..."
            rows={4}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
              ${frontError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
              }
            `}
          />
          {frontError && (
            <p className="mt-1 text-sm text-red-600">{frontError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {front.length}/500 characters
          </p>
        </div>

        {/* Back Content */}
        <div>
          <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
            Back Content
          </label>
          <textarea
            id="back"
            value={back}
            onChange={handleBackChange}
            placeholder="Enter the answer or explanation..."
            rows={4}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
              ${backError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500'
              }
            `}
          />
          {backError && (
            <p className="mt-1 text-sm text-red-600">{backError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {back.length}/500 characters
          </p>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && front.trim() && back.trim() && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Card Preview</h3>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="perspective-1000 w-full max-w-sm mx-auto">
            <div
              className={`relative w-full h-64 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                previewFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={handlePreviewFlip}
            >
              {/* Front of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg border border-gray-200 bg-white flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-base font-medium text-gray-800 leading-relaxed">
                    {front.trim()}
                  </p>
                </div>
              </div>

              {/* Back of card */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-lg border border-gray-200 flex flex-col p-4"
                style={{ backgroundColor: deckColor }}
              >
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-base font-medium text-white leading-relaxed text-center">
                    {back.trim()}
                  </p>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-white opacity-90">
                    {deckName}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-2">
            Click the card to flip it
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div>
          {front.trim() && back.trim() && !showPreview && (
            <button
              type="button"
              onClick={handlePreview}
              className="px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Preview Card
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid}
            className={`
              px-4 py-2 rounded-md transition-colors
              ${!isFormValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {isEditing ? 'Update Card' : 'Save Card'}
          </button>
        </div>
      </div>
    </div>
  );
};