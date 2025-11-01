import React, { useState, useEffect, useCallback } from 'react';
import { Deck, Card } from '../../types/flashcard';
import { FlashCard } from './FlashCard';
import { flashcardStorage } from '../../lib/flashcardStorage';

interface StudyInterfaceProps {
  deck: Deck;
  cards: Card[];
  onExit: () => void;
}

export const StudyInterface: React.FC<StudyInterfaceProps> = ({
  deck,
  cards: initialCards,
  onExit
}) => {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Load cards from storage if not provided or if deck changes
  useEffect(() => {
    if (!initialCards.length) {
      const deckCards = flashcardStorage.getCards(deck.id);
      setCards(deckCards);
    }
  }, [deck.id, initialCards.length]);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  const currentCard = cards[currentCardIndex];
  const isLastCard = currentCardIndex === cards.length - 1;
  const isFirstCard = currentCardIndex === 0;

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleNext = useCallback(() => {
    if (isLastCard) {
      setIsComplete(true);
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  }, [isLastCard, currentCardIndex]);

  const handlePrevious = useCallback(() => {
    if (!isFirstCard) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  }, [isFirstCard, currentCardIndex]);

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent keyboard shortcuts when in completion state
    if (isComplete) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        handleFlip();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleNext();
        break;
      case 'Escape':
        event.preventDefault();
        onExit();
        break;
      default:
        break;
    }
  }, [isComplete, handleFlip, handlePrevious, handleNext, onExit]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle empty deck
  if (!cards.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Cards Found</h2>
          <p className="text-gray-600 mb-6">This deck doesn't contain any cards yet.</p>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Decks
          </button>
        </div>
      </div>
    );
  }

  // Handle completion state
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Deck Complete!</h2>
          <p className="text-gray-600 mb-6">
            You've studied all {cards.length} cards in "{deck.name}".
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRestart}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Study Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with deck info and exit button */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{deck.name}</h1>
            <p className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {cards.length}
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Exit Study
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
                backgroundColor: deck.color
              }}
            />
          </div>
        </div>
      </div>

      {/* Main card area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <FlashCard
            card={currentCard}
            deckName={deck.name}
            deckColor={deck.color}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </div>
      </div>

      {/* Navigation controls */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevious}
              disabled={isFirstCard}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isFirstCard
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleFlip}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isFlipped ? 'Show Front' : 'Show Back'}
              </button>
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLastCard ? 'Finish' : 'Next'}
            </button>
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="text-center text-xs text-gray-500">
            <span className="inline-block mx-2">← → Navigate</span>
            <span className="inline-block mx-2">Space Flip</span>
            <span className="inline-block mx-2">Esc Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};