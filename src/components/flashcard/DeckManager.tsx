import React, { useState, useEffect } from 'react';
import { Deck } from '../../types/flashcard';
import { flashcardStorage } from '../../lib/flashcardStorage';
import { CSVImporter } from './CSVImporter';
import { DeckCreationDialog } from './DeckCreationDialog';

interface DeckManagerProps {
  onSelectDeck: (deckId: string) => void;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  deckName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  deckName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Deck</h2>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-gray-700">
            Are you sure you want to delete the deck "{deckName}"? This action cannot be undone and will remove all cards in this deck.
          </p>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete Deck
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeckManager: React.FC<DeckManagerProps> = ({ onSelectDeck }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [showImporter, setShowImporter] = useState(false);
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [importedCards, setImportedCards] = useState<{ front: string; back: string }[]>([]);
  const [defaultDeckName, setDefaultDeckName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ deckId: string; deckName: string } | null>(null);

  // Load decks on component mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    try {
      const allDecks = flashcardStorage.getAllDecks();
      setDecks(allDecks);
    } catch (error) {
      setError('Failed to load decks. Please try refreshing the page.');
      console.error('Error loading decks:', error);
    }
  };

  const handleImportSuccess = (cards: { front: string; back: string }[], fileName: string) => {
    setImportedCards(cards);
    setDefaultDeckName(fileName);
    setShowImporter(false);
    setShowDeckDialog(true);
    setError(null);
  };

  const handleImportError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
  };

  const handleCreateDeck = (name: string, color: string) => {
    try {
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
      setSuccess(`Successfully created deck "${name}" with ${cards.length} cards`);
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      setError('Failed to create deck. Please try again.');
      console.error('Error creating deck:', error);
    }
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    setConfirmDelete({ deckId, deckName });
  };

  const confirmDeckDeletion = () => {
    if (!confirmDelete) return;
    
    try {
      flashcardStorage.deleteDeck(confirmDelete.deckId);
      loadDecks();
      setSuccess(`Successfully deleted deck "${confirmDelete.deckName}"`);
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to delete deck. Please try again.');
      console.error('Error deleting deck:', error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const cancelDeckDeletion = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Flashcard Decks</h1>
        <p className="text-gray-600">
          Create and manage your flashcard decks. Import CSV files to get started.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Import Section */}
      {!showImporter && decks.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No decks yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by importing your first CSV file to create a flashcard deck.
          </p>
          <button
            onClick={() => setShowImporter(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Import CSV File
          </button>
        </div>
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

      {/* Deck Grid */}
      {decks.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Decks ({decks.length})
            </h2>
            <button
              onClick={() => setShowImporter(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Import New Deck
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Deck Color Bar */}
                <div 
                  className="h-2"
                  style={{ backgroundColor: deck.color }}
                />
                
                {/* Deck Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0 ml-3"
                      style={{ backgroundColor: deck.color }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4">
                    Created {deck.createdAt.toLocaleDateString()}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectDeck(deck.id)}
                      disabled={deck.cardCount === 0}
                      className={`
                        flex-1 px-4 py-2 rounded-md transition-colors font-medium
                        ${deck.cardCount === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                      `}
                    >
                      {deck.cardCount === 0 ? 'No Cards' : 'Study'}
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck.id, deck.name)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete deck"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
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
      />
    </div>
  );
};