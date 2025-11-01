import React, { useState, useEffect } from 'react';
import { Deck, CardMixingSession } from '../../types/flashcard';
import { getTotalAvailableCards, validateCardMixingParams } from '../../lib/cardMixingUtils';
import { flashcardStorage } from '../../lib/flashcardStorage';

interface CardMixerProps {
  decks: Deck[];
  allCards: Record<string, any[]>;
  onMixCards: (selectedDeckIds: string[], cardCount: number) => void;
  onBack: () => void;
}

export const CardMixer: React.FC<CardMixerProps> = ({
  decks,
  allCards,
  onMixCards,
  onBack
}) => {
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([]);
  const [requestedCardCount, setRequestedCardCount] = useState<number>(5);
  const [validationError, setValidationError] = useState<string>('');
  const [maxAvailable, setMaxAvailable] = useState<number>(0);
  const [recentSessions, setRecentSessions] = useState<CardMixingSession[]>([]);

  // Load recent sessions on component mount
  useEffect(() => {
    try {
      const sessions = flashcardStorage.getRecentMixingSessions();
      setRecentSessions(sessions);
    } catch (error) {
      console.warn('Failed to load recent mixing sessions:', error);
    }
  }, []);

  // Calculate total available cards when selection changes
  useEffect(() => {
    const total = getTotalAvailableCards(selectedDeckIds, allCards);
    setMaxAvailable(total);
    
    // Clear validation error when selection changes
    setValidationError('');
    
    // Adjust requested count if it exceeds available
    if (requestedCardCount > total && total > 0) {
      setRequestedCardCount(total);
    }
  }, [selectedDeckIds, allCards, requestedCardCount]);

  const handleDeckToggle = (deckId: string) => {
    setSelectedDeckIds(prev => {
      if (prev.includes(deckId)) {
        return prev.filter(id => id !== deckId);
      } else {
        return [...prev, deckId];
      }
    });
  };

  const handleCardCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0) {
      setRequestedCardCount(Math.min(count, maxAvailable));
    }
  };

  const handleMixCards = () => {
    const validation = validateCardMixingParams(selectedDeckIds, requestedCardCount, allCards);
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid parameters');
      return;
    }
    
    setValidationError('');
    onMixCards(selectedDeckIds, requestedCardCount);
  };

  const handleLoadRecentSession = (session: CardMixingSession) => {
    // Filter out decks that no longer exist
    const validDeckIds = session.selectedDeckIds.filter(deckId => 
      decks.some(deck => deck.id === deckId)
    );
    
    if (validDeckIds.length === 0) {
      setValidationError('The decks from this session are no longer available');
      return;
    }
    
    setSelectedDeckIds(validDeckIds);
    
    // Adjust card count if necessary
    const totalAvailable = getTotalAvailableCards(validDeckIds, allCards);
    setRequestedCardCount(Math.min(session.cardCount, totalAvailable));
    setValidationError('');
  };

  const isValidSelection = selectedDeckIds.length > 0 && requestedCardCount > 0 && requestedCardCount <= maxAvailable;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mix Cards</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Go back to deck list"
          >
            ← Back
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Select multiple decks and specify how many cards you'd like to draw for a mixed study session.
            Cards will be randomly selected and displayed in a tarot-like layout.
          </p>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mixing Sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentSessions.map((session) => {
                const validDeckCount = session.selectedDeckIds.filter(deckId => 
                  decks.some(deck => deck.id === deckId)
                ).length;
                const isValid = validDeckCount > 0;
                
                return (
                  <button
                    key={session.id}
                    onClick={() => handleLoadRecentSession(session)}
                    disabled={!isValid}
                    className={`
                      p-3 text-left rounded-lg border transition-colors
                      ${isValid
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {session.cardCount} cards from {validDeckCount}/{session.selectedDeckIds.length} decks
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {session.timestamp.toLocaleDateString()} at {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {!isValid && (
                      <div className="text-xs text-red-500 mt-1">
                        Some decks no longer exist
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Deck Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Decks</h3>
          
          {decks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No decks available. Create some decks first to use the card mixing feature.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck) => {
                const isSelected = selectedDeckIds.includes(deck.id);
                const deckCardCount = allCards[deck.id]?.length || 0;
                
                return (
                  <div
                    key={deck.id}
                    className={`
                      relative p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                    onClick={() => handleDeckToggle(deck.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDeckToggle(deck.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        aria-label={`Select ${deck.name} deck`}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: deck.color }}
                            aria-hidden="true"
                          />
                          <h4 className="font-medium text-gray-900">{deck.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {deckCardCount} card{deckCardCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card Count Selection */}
        {selectedDeckIds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Cards</h3>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-xs">
                <label htmlFor="cardCount" className="sr-only">
                  Number of cards to draw
                </label>
                <input
                  id="cardCount"
                  type="number"
                  min="1"
                  max={maxAvailable}
                  value={requestedCardCount}
                  onChange={(e) => handleCardCountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of cards"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Max available: <span className="font-medium">{maxAvailable}</span>
              </div>
            </div>
            
            {/* Quick selection buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[3, 5, 7, 10].map((count) => (
                <button
                  key={count}
                  onClick={() => setRequestedCardCount(Math.min(count, maxAvailable))}
                  disabled={count > maxAvailable}
                  className={`
                    px-3 py-1 text-sm rounded-md transition-colors
                    ${count <= maxAvailable
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {selectedDeckIds.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selection Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">{selectedDeckIds.length}</span> deck{selectedDeckIds.length !== 1 ? 's' : ''} selected
              </p>
              <p>
                <span className="font-medium">{maxAvailable}</span> total cards available
              </p>
              <p>
                Drawing <span className="font-medium">{requestedCardCount}</span> card{requestedCardCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{validationError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleMixCards}
            disabled={!isValidSelection}
            className={`
              px-6 py-2 rounded-md font-medium transition-colors
              ${isValidSelection
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Mix Cards
          </button>
        </div>
      </div>
    </div>
  );
};