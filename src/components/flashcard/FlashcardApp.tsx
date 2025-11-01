import React, { useState, useEffect } from 'react';
import { Deck, Card, MixedCard } from '../../types/flashcard';
import { flashcardStorage } from '../../lib/flashcardStorage';
import { mixCards } from '../../lib/cardMixingUtils';
import { DeckManager } from './DeckManager';
import { StudyInterface } from './StudyInterface';
import { CardMixer } from './CardMixer';
import { MixedCardDisplay } from './MixedCardDisplay';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorProvider, useErrorHandler } from './ErrorContext';
import { LoadingProvider } from './LoadingContext';

interface StudySession {
  deck: Deck;
  cards: Card[];
}

interface MixingSession {
  mixedCards: MixedCard[];
  selectedDeckIds: string[];
  cardCount: number;
}

type AppView = 'deck-list' | 'study' | 'card-mixer' | 'mixed-display';

const FlashcardAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('deck-list');
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [mixingSession, setMixingSession] = useState<MixingSession | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [allCards, setAllCards] = useState<Record<string, Card[]>>({});
  const { showStorageError, addError } = useErrorHandler();

  // Load data and check storage health on component mount
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

    // Load decks and cards
    loadDecksAndCards();

    // Clean up old mixing sessions
    try {
      flashcardStorage.cleanupOldMixingSessions();
    } catch (error) {
      console.warn('Failed to cleanup old mixing sessions:', error);
    }
  }, [showStorageError, addError]);

  const loadDecksAndCards = () => {
    try {
      const allDecks = flashcardStorage.getAllDecks();
      setDecks(allDecks);

      // Load cards for all decks
      const cardsMap: Record<string, Card[]> = {};
      allDecks.forEach(deck => {
        cardsMap[deck.id] = flashcardStorage.getCards(deck.id);
      });
      setAllCards(cardsMap);
    } catch (error) {
      addError({
        type: 'error',
        title: 'Failed to Load Data',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while loading data.'
      });
    }
  };

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
      setCurrentView('study');
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
    setCurrentView('deck-list');
  };

  const handleStartCardMixing = () => {
    setCurrentView('card-mixer');
  };

  const handleMixCards = (selectedDeckIds: string[], cardCount: number) => {
    try {
      // Create decks map for mixing utility
      const decksMap: Record<string, Deck> = {};
      decks.forEach(deck => {
        decksMap[deck.id] = deck;
      });

      const result = mixCards(selectedDeckIds, cardCount, allCards, decksMap);
      
      if (!result.success || !result.mixedCards) {
        addError({
          type: 'error',
          title: 'Card Mixing Failed',
          message: result.error || 'Failed to mix cards'
        });
        return;
      }

      // Save mixing session for quick access
      try {
        flashcardStorage.saveMixingSession({
          selectedDeckIds,
          cardCount
        });
      } catch (error) {
        // Don't fail the mixing if session saving fails
        console.warn('Failed to save mixing session:', error);
      }

      setMixingSession({
        mixedCards: result.mixedCards,
        selectedDeckIds,
        cardCount
      });
      setCurrentView('mixed-display');
    } catch (error) {
      addError({
        type: 'error',
        title: 'Card Mixing Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while mixing cards.'
      });
    }
  };

  const handleReshuffle = () => {
    if (!mixingSession) return;
    
    // Re-mix with the same parameters
    handleMixCards(mixingSession.selectedDeckIds, mixingSession.cardCount);
  };

  const handleBackToDeckList = () => {
    setCurrentView('deck-list');
    setCurrentSession(null);
    setMixingSession(null);
    // Reload data in case it changed
    loadDecksAndCards();
  };

  const handleBackToCardMixer = () => {
    setCurrentView('card-mixer');
    setMixingSession(null);
  };

  // Render based on current view
  switch (currentView) {
    case 'study':
      if (!currentSession) {
        setCurrentView('deck-list');
        return null;
      }
      return (
        <StudyInterface
          deck={currentSession.deck}
          cards={currentSession.cards}
          onExit={handleExitStudy}
        />
      );

    case 'card-mixer':
      return (
        <div className="min-h-screen bg-gray-50">
          <CardMixer
            decks={decks}
            allCards={allCards}
            onMixCards={handleMixCards}
            onBack={handleBackToDeckList}
          />
        </div>
      );

    case 'mixed-display':
      if (!mixingSession) {
        setCurrentView('deck-list');
        return null;
      }
      return (
        <div className="min-h-screen bg-gray-50">
          <MixedCardDisplay
            mixedCards={mixingSession.mixedCards}
            onReshuffle={handleReshuffle}
            onBack={handleBackToCardMixer}
          />
        </div>
      );

    case 'deck-list':
    default:
      return (
        <div className="min-h-screen bg-gray-50">
          <DeckManager 
            onSelectDeck={handleSelectDeck}
            onStartCardMixing={handleStartCardMixing}
          />
        </div>
      );
  }
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