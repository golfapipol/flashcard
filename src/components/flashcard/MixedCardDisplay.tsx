import React, { useState, useEffect } from 'react';
import { MixedCard } from '../../types/flashcard';
import { calculateGridLayout, generateGridTemplate } from '../../lib/cardMixingUtils';

interface MixedCardDisplayProps {
  mixedCards: MixedCard[];
  onReshuffle: () => void;
  onBack: () => void;
}

interface CardFlipState {
  [cardId: string]: boolean;
}

export const MixedCardDisplay: React.FC<MixedCardDisplayProps> = ({
  mixedCards,
  onReshuffle,
  onBack
}) => {
  const [flippedCards, setFlippedCards] = useState<CardFlipState>({});
  const [gridLayout, setGridLayout] = useState(calculateGridLayout(mixedCards.length));

  // Recalculate grid layout when cards change
  useEffect(() => {
    setGridLayout(calculateGridLayout(mixedCards.length));
    // Reset flip states when cards change
    setFlippedCards({});
  }, [mixedCards]);

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent, cardId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardFlip(cardId);
    }
  };

  const flipAllCards = () => {
    const allFlipped = mixedCards.every(card => flippedCards[card.id]);
    const newFlipState: CardFlipState = {};
    
    mixedCards.forEach(card => {
      newFlipState[card.id] = !allFlipped;
    });
    
    setFlippedCards(newFlipState);
  };

  const gridStyle = generateGridTemplate(gridLayout);

  if (mixedCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Cards Available</h2>
          <p className="text-gray-600 mb-6">
            No cards were found in the selected decks. Please go back and try again.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mixed Cards</h2>
            <p className="text-gray-600 mt-1">
              {mixedCards.length} card{mixedCards.length !== 1 ? 's' : ''} drawn from multiple decks
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={flipAllCards}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              {mixedCards.every(card => flippedCards[card.id]) ? 'Flip All Front' : 'Flip All Back'}
            </button>
            
            <button
              onClick={onReshuffle}
              className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              🔄 Reshuffle
            </button>
            
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <div
          className="grid gap-4 md:gap-6 w-full"
          style={{
            ...gridStyle,
            minHeight: '400px'
          }}
        >
          {mixedCards.map((card) => {
            const isFlipped = flippedCards[card.id] || false;
            
            return (
              <div
                key={card.id}
                className="relative aspect-[3/4] min-h-[200px] cursor-pointer group"
                onClick={() => handleCardFlip(card.id)}
                onKeyDown={(e) => handleKeyDown(e, card.id)}
                tabIndex={0}
                role="button"
                aria-label={`Card ${card.position + 1}: ${isFlipped ? card.back : card.front}. Click to flip.`}
              >
                {/* Card Container */}
                <div className="relative w-full h-full preserve-3d transition-transform duration-500 group-hover:scale-105">
                  <div
                    className={`
                      absolute inset-0 w-full h-full backface-hidden transition-transform duration-500
                      ${isFlipped ? 'rotate-y-180' : ''}
                    `}
                  >
                    {/* Front Side */}
                    <div className="w-full h-full bg-white border-2 border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
                      <div className="text-sm md:text-base text-gray-800 leading-relaxed">
                        {card.front}
                      </div>
                      
                      {/* Deck indicator on front */}
                      <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: card.deckColor }}
                          aria-hidden="true"
                        />
                        <span className="text-xs text-gray-500 truncate max-w-[80px]">
                          {card.deckName}
                        </span>
                      </div>
                      
                      {/* Position indicator */}
                      <div className="absolute top-2 right-2 text-xs text-gray-400">
                        {card.position + 1}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`
                      absolute inset-0 w-full h-full backface-hidden rotate-y-180 transition-transform duration-500
                      ${isFlipped ? 'rotate-y-0' : ''}
                    `}
                  >
                    {/* Back Side */}
                    <div
                      className="w-full h-full rounded-lg shadow-md p-4 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow"
                      style={{ backgroundColor: card.deckColor }}
                    >
                      <div className="text-sm md:text-base text-white leading-relaxed font-medium">
                        {card.back}
                      </div>
                      
                      {/* Deck name on back */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-xs text-white/80 truncate">
                          {card.deckName}
                        </div>
                      </div>
                      
                      {/* Position indicator */}
                      <div className="absolute top-2 right-2 text-xs text-white/60">
                        {card.position + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm text-center">
          Click on any card to flip it and reveal the answer. Use the controls above to flip all cards or reshuffle for a new layout.
        </p>
      </div>

      {/* Keyboard shortcuts info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Keyboard: <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to flip focused card
        </p>
      </div>
    </div>
  );
};