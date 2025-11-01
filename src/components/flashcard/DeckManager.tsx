import React, { useState, useEffect } from 'react';
import { Deck } from '../../types/flashcard';
import { flashcardStorage } from '../../lib/flashcardStorage';
import { CSVImporter } from './CSVImporter';
import { DeckCreationDialog } from './DeckCreationDialog';
import { ManualDeckCreator } from './ManualDeckCreator';
import { useErrorHandler } from './ErrorContext';
import { useLoading, LoadingButton } from './LoadingContext';

interface DeckManagerProps {
  onSelectDeck: (deckId: string) => void;
  onStartCardMixing?: () => void;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  deckName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  deckName,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus management
  React.useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within dialog
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
      
      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableElements = dialog.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div ref={dialogRef} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 id="dialog-title" className="text-lg sm:text-xl font-semibold text-gray-900">Delete Deck</h2>
        </div>
        
        <div className="px-4 sm:px-6 py-4">
          <p id="dialog-description" className="text-sm sm:text-base text-gray-700">
            Are you sure you want to delete the deck "{deckName}"? This action cannot be undone and will remove all cards in this deck.
          </p>
        </div>
        
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-3 sm:space-x-0">
          <LoadingButton
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base order-2 sm:order-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            type="button"
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText="Deleting..."
            className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base order-1 sm:order-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Deck
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export const DeckManager: React.FC<DeckManagerProps> = ({ onSelectDeck, onStartCardMixing }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [showImporter, setShowImporter] = useState(false);
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [showManualCreator, setShowManualCreator] = useState(false);
  const [importedCards, setImportedCards] = useState<{ front: string; back: string }[]>([]);
  const [defaultDeckName, setDefaultDeckName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ deckId: string; deckName: string } | null>(null);
  const { addError, showSuccess, showStorageError } = useErrorHandler();
  const { setLoading, isLoading } = useLoading();

  // Load decks on component mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    try {
      const allDecks = flashcardStorage.getAllDecks();
      setDecks(allDecks);
    } catch (error) {
      showStorageError('Failed to load decks. This might be due to corrupted data or storage issues.');
      console.error('Error loading decks:', error);
    }
  };

  const handleImportSuccess = (cards: { front: string; back: string }[], fileName: string) => {
    setImportedCards(cards);
    setDefaultDeckName(fileName);
    setShowImporter(false);
    setShowDeckDialog(true);
  };

  const handleImportError = (errorMessage: string) => {
    addError({
      type: 'error',
      title: 'CSV Import Failed',
      message: errorMessage
    });
  };

  const handleCreateDeck = async (name: string, color: string) => {
    setLoading('createDeck', true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      // Generate unique ID
      const deckId = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create deck
      const newDeck: Deck = {
        id: deckId,
        name,
        color,
        createdAt: new Date(),
        cardCount: importedCards.length
      };

      // Save deck
      flashcardStorage.saveDeck(newDeck);

      // Create and save cards
      const cards = importedCards.map((cardData, index) => ({
        id: `card_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        deckId,
        front: cardData.front,
        back: cardData.back,
        createdAt: new Date()
      }));

      flashcardStorage.saveCards(deckId, cards);

      // Update local state
      loadDecks();
      
      // Clear import data
      setImportedCards([]);
      setDefaultDeckName('');
      
      // Show success message
      showSuccess(`Successfully created deck "${name}" with ${cards.length} cards`);
      
    } catch (error) {
      addError({
        type: 'error',
        title: 'Failed to Create Deck',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while creating the deck.'
      });
      console.error('Error creating deck:', error);
    } finally {
      setLoading('createDeck', false);
    }
  };

  const handleCreateManualDeck = async (cards: { front: string; back: string }[], name: string, color: string) => {
    setLoading('createManualDeck', true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      // Generate unique ID
      const deckId = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create deck
      const newDeck: Deck = {
        id: deckId,
        name,
        color,
        createdAt: new Date(),
        cardCount: cards.length
      };

      // Save deck
      flashcardStorage.saveDeck(newDeck);

      // Create and save cards
      const deckCards = cards.map((cardData, index) => ({
        id: `card_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        deckId,
        front: cardData.front,
        back: cardData.back,
        createdAt: new Date()
      }));

      flashcardStorage.saveCards(deckId, deckCards);

      // Update local state
      loadDecks();
      
      // Hide manual creator
      setShowManualCreator(false);
      
      // Show success message
      showSuccess(`Successfully created deck "${name}" with ${cards.length} cards`);
      
    } catch (error) {
      addError({
        type: 'error',
        title: 'Failed to Create Deck',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while creating the deck.'
      });
      console.error('Error creating deck:', error);
    } finally {
      setLoading('createManualDeck', false);
    }
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    setConfirmDelete({ deckId, deckName });
  };

  const confirmDeckDeletion = async () => {
    if (!confirmDelete) return;
    
    setLoading('deleteDeck', true);
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));
      flashcardStorage.deleteDeck(confirmDelete.deckId);
      loadDecks();
      showSuccess(`Successfully deleted deck "${confirmDelete.deckName}"`);
    } catch (error) {
      addError({
        type: 'error',
        title: 'Failed to Delete Deck',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the deck.'
      });
      console.error('Error deleting deck:', error);
    } finally {
      setLoading('deleteDeck', false);
      setConfirmDelete(null);
    }
  };

  const cancelDeckDeletion = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Flashcard Decks</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Create and manage your flashcard decks. Import CSV files to get started.
        </p>
      </header>

      {/* Empty State */}
      {!showImporter && !showManualCreator && decks.length === 0 && (
        <main className="text-center py-8 sm:py-12 px-4" role="main">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No decks yet</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
            Get started by creating your first flashcard deck. You can import from a CSV file or create cards manually.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm sm:max-w-none mx-auto">
            <LoadingButton
              onClick={() => setShowImporter(true)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Import flashcards from CSV file"
            >
              Import CSV File
            </LoadingButton>
            <LoadingButton
              onClick={() => setShowManualCreator(true)}
              className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Create flashcard deck manually"
            >
              Create Manual Deck
            </LoadingButton>
          </div>
        </main>
      )}

      {/* Import CSV Section */}
      {showImporter && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import New Deck</h2>
            <button
              onClick={() => setShowImporter(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <CSVImporter onImport={handleImportSuccess} onError={handleImportError} />
        </div>
      )}

      {/* Manual Deck Creator Section */}
      {showManualCreator && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Manual Deck</h2>
            <button
              onClick={() => setShowManualCreator(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ManualDeckCreator 
            onCreateDeck={handleCreateManualDeck} 
            onCancel={() => setShowManualCreator(false)} 
          />
        </div>
      )}

      {/* Deck Grid */}
      {decks.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Your Decks ({decks.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {onStartCardMixing && (
                <LoadingButton
                  onClick={onStartCardMixing}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label="Mix cards from multiple decks"
                >
                  🔮 Mix Cards
                </LoadingButton>
              )}
              <LoadingButton
                onClick={() => setShowImporter(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Import new deck from CSV file"
              >
                Import CSV
              </LoadingButton>
              <LoadingButton
                onClick={() => setShowManualCreator(true)}
                className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Create new deck manually"
              >
                Create Manual Deck
              </LoadingButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Flashcard decks">
            {decks.map((deck) => (
              <article
                key={deck.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                role="listitem"
              >
                {/* Deck Color Bar */}
                <div 
                  className="h-2"
                  style={{ backgroundColor: deck.color }}
                  aria-hidden="true"
                />
                
                {/* Deck Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0 ml-3"
                      style={{ backgroundColor: deck.color }}
                      aria-label={`Deck color indicator`}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                    Created {deck.createdAt.toLocaleDateString()}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <LoadingButton
                      onClick={() => onSelectDeck(deck.id)}
                      disabled={deck.cardCount === 0}
                      className={`
                        flex-1 px-3 sm:px-4 py-2 rounded-md transition-colors font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${deck.cardCount === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                      `}
                      aria-label={deck.cardCount === 0 ? `Cannot study ${deck.name} - no cards available` : `Study ${deck.name} deck with ${deck.cardCount} cards`}
                    >
                      {deck.cardCount === 0 ? 'No Cards' : 'Study'}
                    </LoadingButton>
                    <button
                      onClick={() => handleDeleteDeck(deck.id, deck.name)}
                      className="px-2 sm:px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete ${deck.name} deck`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Deck Creation Dialog */}
      <DeckCreationDialog
        isOpen={showDeckDialog}
        onClose={() => {
          setShowDeckDialog(false);
          setImportedCards([]);
          setDefaultDeckName('');
        }}
        onCreateDeck={handleCreateDeck}
        defaultName={defaultDeckName}
        cardCount={importedCards.length}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!confirmDelete}
        deckName={confirmDelete?.deckName || ''}
        onConfirm={confirmDeckDeletion}
        onCancel={cancelDeckDeletion}
        isDeleting={isLoading('deleteDeck')}
      />
    </div>
  );
};