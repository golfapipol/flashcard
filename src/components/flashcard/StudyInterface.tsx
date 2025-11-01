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
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No Cards Found</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">This deck doesn't contain any cards yet.</p>
          <button
            onClick={onExit}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Deck Complete!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            You've studied all {cards.length} cards in "{deck.name}".
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Study Again
            </button>
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
      <header className="bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{deck.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600" aria-live="polite">
              Card {currentCardIndex + 1} of {cards.length}
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base flex-shrink-0 ml-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Exit study session and return to deck list"
          >
            <span className="hidden sm:inline">Exit Study</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div 
            className="w-full bg-gray-200 rounded-full h-2"
            role="progressbar"
            aria-valuenow={currentCardIndex + 1}
            aria-valuemin={1}
            aria-valuemax={cards.length}
            aria-label={`Study progress: ${currentCardIndex + 1} of ${cards.length} cards`}
          >
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
      <main className="flex-1 flex items-center justify-center p-4" role="main">
        <div className="w-full max-w-md">
          <FlashCard
            card={currentCard}
            deckName={deck.name}
            deckColor={deck.color}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onSwipeLeft={handleNext}
            onSwipeRight={handlePrevious}
          />
        </div>
      </main>

      {/* Navigation controls */}
      <nav className="bg-white border-t border-gray-200 p-3 sm:p-4" role="navigation" aria-label="Flashcard navigation">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2 gap-2">
            <button
              onClick={handlePrevious}
              disabled={isFirstCard}
              className={`px-3 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isFirstCard
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label={isFirstCard ? 'Previous card (not available)' : 'Go to previous card'}
              aria-disabled={isFirstCard}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="flex items-center">
              <button
                onClick={handleFlip}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={isFlipped ? 'Show front of card' : 'Show back of card'}
              >
                <span className="hidden sm:inline">{isFlipped ? 'Show Front' : 'Show Back'}</span>
                <span className="sm:hidden">Flip</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isLastCard ? 'Finish study session' : 'Go to next card'}
            >
              <span className="hidden sm:inline">{isLastCard ? 'Finish' : 'Next'}</span>
              <span className="sm:hidden">{isLastCard ? 'Done' : 'Next'}</span>
            </button>
          </div>
          
          {/* Keyboard shortcuts hint - hidden on mobile */}
          <div className="text-center text-xs text-gray-500 hidden sm:block" aria-label="Keyboard shortcuts">
            <span className="inline-block mx-2">← → Navigate</span>
            <span className="inline-block mx-2">Space Flip</span>
            <span className="inline-block mx-2">Esc Exit</span>
          </div>
        </div>
      </nav>
    </div>
  );
};