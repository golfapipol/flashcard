import React, { useState, useEffect } from 'react';
import { Deck, Card } from '../../types/flashcard';
import { flashcardStorage } from '../../lib/flashcardStorage';
import { DeckManager } from './DeckManager';
import { StudyInterface } from './StudyInterface';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorProvider, useErrorHandler } from './ErrorContext';
import { LoadingProvider } from './LoadingContext';

interface StudySession {
  deck: Deck;
  cards: Card[];
}

const FlashcardAppContent: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const { showStorageError, addError } = useErrorHandler();

  // Check storage health on component mount
  useEffect(() => {
    const healthCheck = flashcardStorage.checkStorageHealth();
    if (!healthCheck.available) {
      showStorageError('localStorage is not available. Your data will not be saved between sessions.');
    } else if (healthCheck.warning) {
      addError({
        type: 'warning',
        title: 'Storage Warning',
        message: healthCheck.warning
      });
    }
  }, [showStorageError, addError]);

  const handleSelectDeck = (deckId: string) => {
    try {
      const deck = flashcardStorage.getDeck(deckId);
      if (!deck) {
        addError({
          type: 'error',
          title: 'Deck Not Found',
          message: 'The selected deck could not be found. It may have been deleted.'
        });
        return;
      }

      const cards = flashcardStorage.getCards(deckId);
      if (cards.length === 0) {
        addError({
          type: 'warning',
          title: 'Empty Deck',
          message: 'This deck has no cards to study. Add some cards first.'
        });
        return;
      }

      setCurrentSession({ deck, cards });
    } catch (error) {
      addError({
        type: 'error',
        title: 'Failed to Load Deck',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while loading the deck.'
      });
    }
  };

  const handleExitStudy = () => {
    setCurrentSession(null);
  };

  // If in study mode, render the study interface
  if (currentSession) {
    return (
      <StudyInterface
        deck={currentSession.deck}
        cards={currentSession.cards}
        onExit={handleExitStudy}
      />
    );
  }

  // Otherwise, render the deck management interface
  return (
    <div className="min-h-screen bg-gray-50">
      <DeckManager onSelectDeck={handleSelectDeck} />
    </div>
  );
};

// Main component with error boundary and context
const FlashcardApp: React.FC = () => {
  return (
    <ErrorProvider>
      <LoadingProvider>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('FlashcardApp Error Boundary:', error, errorInfo);
            // Could integrate with error reporting service here
          }}
        >
          <FlashcardAppContent />
        </ErrorBoundary>
      </LoadingProvider>
    </ErrorProvider>
  );
};

export default FlashcardApp;