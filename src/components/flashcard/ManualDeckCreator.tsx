import React, { useState } from 'react';
import { DECK_COLORS, DeckColor } from '../../types/flashcard';
import { CardEditor } from './CardEditor';
import { useLoading, LoadingButton } from './LoadingContext';

interface CardData {
  front: string;
  back: string;
}

interface ManualDeckCreatorProps {
  onCreateDeck: (cards: CardData[], deckName: string, deckColor: string) => void;
  onCancel: () => void;
}

type Step = 'deck-info' | 'add-cards' | 'edit-card';

export const ManualDeckCreator: React.FC<ManualDeckCreatorProps> = ({
  onCreateDeck,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('deck-info');
  const [deckName, setDeckName] = useState('');
  const [selectedColor, setSelectedColor] = useState<DeckColor>(DECK_COLORS[0]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [nameError, setNameError] = useState('');
  const { isLoading } = useLoading();

  const validateDeckName = (name: string): boolean => {
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

  const handleDeckNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setDeckName(newName);
    
    // Clear error when user starts typing
    if (nameError && newName.trim()) {
      setNameError('');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'deck-info') {
      if (validateDeckName(deckName)) {
        setCurrentStep('add-cards');
      }
    }
  };

  const handleAddCard = () => {
    setEditingCardIndex(null);
    setCurrentStep('edit-card');
  };

  const handleEditCard = (index: number) => {
    setEditingCardIndex(index);
    setCurrentStep('edit-card');
  };

  const handleRemoveCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
  };

  const handleSaveCard = (cardData: CardData) => {
    if (editingCardIndex !== null) {
      // Editing existing card
      const newCards = [...cards];
      newCards[editingCardIndex] = cardData;
      setCards(newCards);
    } else {
      // Adding new card
      setCards([...cards, cardData]);
    }
    setCurrentStep('add-cards');
    setEditingCardIndex(null);
  };

  const handleCancelCardEdit = () => {
    setCurrentStep('add-cards');
    setEditingCardIndex(null);
  };

  const handleCreateDeck = () => {
    if (cards.length === 0) {
      return; // This should be prevented by the UI
    }
    onCreateDeck(cards, deckName.trim(), selectedColor);
  };

  const handleCancel = () => {
    // Reset all state
    setCurrentStep('deck-info');
    setDeckName('');
    setSelectedColor(DECK_COLORS[0]);
    setCards([]);
    setEditingCardIndex(null);
    setNameError('');
    onCancel();
  };

  const renderDeckInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Manual Deck</h2>
        <p className="text-gray-600">Set up your deck name and color, then add flashcards</p>
      </div>

      {/* Deck Name Input */}
      <div>
        <label htmlFor="deckName" className="block text-sm font-medium text-gray-700 mb-2">
          Deck Name
        </label>
        <input
          id="deckName"
          type="text"
          value={deckName}
          onChange={handleDeckNameChange}
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
      <div>
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
      </div>

      {/* Preview */}
      <div>
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
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <LoadingButton
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          type="button"
          onClick={handleNextStep}
          disabled={!deckName.trim() || !!nameError}
          className={`
            px-4 py-2 rounded-md transition-colors
            ${!deckName.trim() || !!nameError
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          Next: Add Cards
        </LoadingButton>
      </div>
    </div>
  );

  const renderAddCardsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Flashcards</h2>
          <p className="text-gray-600">
            Deck: <span className="font-medium">{deckName}</span> • 
            <span className="ml-1">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <div 
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      {/* Cards List */}
      {cards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Cards in this deck:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {card.front}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {card.back}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditCard(index)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveCard(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
          <p className="text-gray-500 mb-4">Add your first flashcard to get started</p>
        </div>
      )}

      {/* Add Card Button */}
      <div className="text-center">
        <LoadingButton
          onClick={handleAddCard}
          disabled={isLoading('createManualDeck')}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Card
        </LoadingButton>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <LoadingButton
          type="button"
          onClick={() => setCurrentStep('deck-info')}
          disabled={isLoading('createManualDeck')}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back
        </LoadingButton>
        <div className="flex space-x-3">
          <LoadingButton
            type="button"
            onClick={handleCancel}
            disabled={isLoading('createManualDeck')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            type="button"
            onClick={handleCreateDeck}
            disabled={cards.length === 0}
            isLoading={isLoading('createManualDeck')}
            loadingText="Creating..."
            className={`
              px-4 py-2 rounded-md transition-colors
              ${cards.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
              }
            `}
          >
            Create Deck ({cards.length} card{cards.length !== 1 ? 's' : ''})
          </LoadingButton>
        </div>
      </div>
    </div>
  );

  const renderEditCardStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {editingCardIndex !== null ? 'Edit Card' : 'Add New Card'}
          </h2>
          <p className="text-gray-600">
            Deck: <span className="font-medium">{deckName}</span>
          </p>
        </div>
        <div 
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      <CardEditor
        card={editingCardIndex !== null ? cards[editingCardIndex] : undefined}
        onSave={handleSaveCard}
        onCancel={handleCancelCardEdit}
        isEditing={editingCardIndex !== null}
        deckName={deckName}
        deckColor={selectedColor}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {currentStep === 'deck-info' && renderDeckInfoStep()}
      {currentStep === 'add-cards' && renderAddCardsStep()}
      {currentStep === 'edit-card' && renderEditCardStep()}
    </div>
  );
};