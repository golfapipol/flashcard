import { Deck, Card, FlashcardStorage } from '../types/flashcard';

const STORAGE_KEY = 'flashcard-app-data';
const STORAGE_VERSION = '1.0.0';

/**
 * Storage utility class for managing flashcard data in localStorage
 */
export class FlashcardStorageManager {
  private static instance: FlashcardStorageManager;

  private constructor() {}

  public static getInstance(): FlashcardStorageManager {
    if (!FlashcardStorageManager.instance) {
      FlashcardStorageManager.instance = new FlashcardStorageManager();
    }
    return FlashcardStorageManager.instance;
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the current storage data or initialize empty storage
   */
  private getStorageData(): FlashcardStorage {
    if (!this.isStorageAvailable()) {
      throw new Error('localStorage is not available');
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.initializeStorage();
      }

      const parsed: FlashcardStorage = JSON.parse(data);
      
      // Convert date strings back to Date objects
      Object.values(parsed.decks).forEach((deck: any) => {
        deck.createdAt = new Date(deck.createdAt);
      });
      
      Object.values(parsed.cards).forEach((cardArray: any) => {
        cardArray.forEach((card: any) => {
          card.createdAt = new Date(card.createdAt);
        });
      });

      return parsed;
    } catch (error) {
      console.error('Error parsing storage data:', error);
      return this.initializeStorage();
    }
  }

  /**
   * Initialize empty storage structure
   */
  private initializeStorage(): FlashcardStorage {
    const initialData: FlashcardStorage = {
      decks: {},
      cards: {},
      version: STORAGE_VERSION
    };
    this.saveStorageData(initialData);
    return initialData;
  }

  /**
   * Save storage data to localStorage
   */
  private saveStorageData(data: FlashcardStorage): void {
    if (!this.isStorageAvailable()) {
      throw new Error('localStorage is not available');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new Error('Storage quota exceeded. Please delete some decks to free up space.');
      }
      throw new Error('Failed to save data to storage');
    }
  }

  /**
   * Get all decks
   */
  public getAllDecks(): Deck[] {
    try {
      const data = this.getStorageData();
      return Object.values(data.decks);
    } catch (error) {
      console.error('Error getting decks:', error);
      return [];
    }
  }

  /**
   * Get a specific deck by ID
   */
  public getDeck(deckId: string): Deck | null {
    try {
      const data = this.getStorageData();
      return data.decks[deckId] || null;
    } catch (error) {
      console.error('Error getting deck:', error);
      return null;
    }
  }

  /**
   * Save a new deck
   */
  public saveDeck(deck: Deck): void {
    const data = this.getStorageData();
    data.decks[deck.id] = deck;
    
    // Initialize empty cards array for new deck
    if (!data.cards[deck.id]) {
      data.cards[deck.id] = [];
    }
    
    this.saveStorageData(data);
  }

  /**
   * Delete a deck and all its cards
   */
  public deleteDeck(deckId: string): void {
    const data = this.getStorageData();
    delete data.decks[deckId];
    delete data.cards[deckId];
    this.saveStorageData(data);
  }

  /**
   * Get all cards for a specific deck
   */
  public getCards(deckId: string): Card[] {
    try {
      const data = this.getStorageData();
      return data.cards[deckId] || [];
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  /**
   * Save cards for a specific deck
   */
  public saveCards(deckId: string, cards: Card[]): void {
    const data = this.getStorageData();
    data.cards[deckId] = cards;
    
    // Update deck card count
    if (data.decks[deckId]) {
      data.decks[deckId].cardCount = cards.length;
    }
    
    this.saveStorageData(data);
  }

  /**
   * Add cards to an existing deck
   */
  public addCards(deckId: string, newCards: Card[]): void {
    const existingCards = this.getCards(deckId);
    const allCards = [...existingCards, ...newCards];
    this.saveCards(deckId, allCards);
  }

  /**
   * Clear all data (useful for testing or reset functionality)
   */
  public clearAllData(): void {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Check if storage is available and show appropriate warnings
   */
  public checkStorageHealth(): { available: boolean; warning?: string } {
    if (!this.isStorageAvailable()) {
      return {
        available: false,
        warning: 'localStorage is not available. Your data will not be saved between sessions.'
      };
    }

    try {
      this.getStorageData();
      return { available: true };
    } catch (error) {
      return {
        available: true,
        warning: `Storage warning: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const flashcardStorage = FlashcardStorageManager.getInstance();