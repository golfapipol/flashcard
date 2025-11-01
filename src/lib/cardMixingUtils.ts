/**
 * Utility functions for card mixing functionality
 */

import { Card, Deck, MixedCard, GridLayout } from '../types/flashcard';

/**
 * Fisher-Yates shuffle algorithm for random card selection
 */
export function shuffleCards<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Combine cards from multiple decks into a single pool
 */
export function combineCardsFromDecks(
  selectedDeckIds: string[],
  allCards: Record<string, Card[]>
): Card[] {
  const combinedCards: Card[] = [];
  
  selectedDeckIds.forEach(deckId => {
    const deckCards = allCards[deckId] || [];
    combinedCards.push(...deckCards);
  });
  
  return combinedCards;
}

/**
 * Select a specific number of random cards from a pool
 */
export function selectRandomCards(cards: Card[], count: number): Card[] {
  if (count >= cards.length) {
    return shuffleCards(cards);
  }
  
  const shuffled = shuffleCards(cards);
  return shuffled.slice(0, count);
}

/**
 * Create MixedCard objects with deck metadata
 */
export function createMixedCards(
  cards: Card[],
  decks: Record<string, Deck>
): MixedCard[] {
  return cards.map((card, index) => {
    const deck = decks[card.deckId];
    
    return {
      ...card,
      deckName: deck?.name || 'Unknown Deck',
      deckColor: deck?.color || '#6B7280',
      position: index
    };
  });
}

/**
 * Calculate grid layout based on card count for tarot-like display
 */
export function calculateGridLayout(cardCount: number): GridLayout {
  if (cardCount <= 0) {
    return { rows: 0, cols: 0 };
  }
  
  if (cardCount <= 3) {
    // Single row layout for 1-3 cards
    return { rows: 1, cols: cardCount };
  }
  
  if (cardCount <= 6) {
    // 2x3 grid layout for 4-6 cards
    return { rows: 2, cols: Math.ceil(cardCount / 2) };
  }
  
  if (cardCount <= 9) {
    // 3x3 grid layout for 7-9 cards
    return { rows: 3, cols: Math.ceil(cardCount / 3) };
  }
  
  // Dynamic grid for 10+ cards
  const cols = Math.ceil(Math.sqrt(cardCount));
  const rows = Math.ceil(cardCount / cols);
  
  return { rows, cols };
}

/**
 * Get total available cards from selected decks
 */
export function getTotalAvailableCards(
  selectedDeckIds: string[],
  allCards: Record<string, Card[]>
): number {
  return selectedDeckIds.reduce((total, deckId) => {
    const deckCards = allCards[deckId] || [];
    return total + deckCards.length;
  }, 0);
}

/**
 * Validate card mixing parameters
 */
export function validateCardMixingParams(
  selectedDeckIds: string[],
  requestedCount: number,
  allCards: Record<string, Card[]>
): { valid: boolean; error?: string; maxAvailable?: number } {
  if (selectedDeckIds.length === 0) {
    return { valid: false, error: 'Please select at least one deck' };
  }
  
  if (requestedCount <= 0) {
    return { valid: false, error: 'Number of cards must be greater than 0' };
  }
  
  const totalAvailable = getTotalAvailableCards(selectedDeckIds, allCards);
  
  if (totalAvailable === 0) {
    return { valid: false, error: 'Selected decks contain no cards' };
  }
  
  if (requestedCount > totalAvailable) {
    return {
      valid: false,
      error: `Requested ${requestedCount} cards but only ${totalAvailable} available`,
      maxAvailable: totalAvailable
    };
  }
  
  return { valid: true };
}

/**
 * Generate CSS grid template for responsive layout
 */
export function generateGridTemplate(layout: GridLayout): {
  gridTemplateColumns: string;
  gridTemplateRows: string;
} {
  return {
    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
    gridTemplateRows: `repeat(${layout.rows}, 1fr)`
  };
}

/**
 * Main function to mix cards from selected decks
 */
export function mixCards(
  selectedDeckIds: string[],
  requestedCount: number,
  allCards: Record<string, Card[]>,
  allDecks: Record<string, Deck>
): { success: boolean; mixedCards?: MixedCard[]; error?: string } {
  // Validate parameters
  const validation = validateCardMixingParams(selectedDeckIds, requestedCount, allCards);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  try {
    // Combine cards from selected decks
    const combinedCards = combineCardsFromDecks(selectedDeckIds, allCards);
    
    // Select random cards
    const selectedCards = selectRandomCards(combinedCards, requestedCount);
    
    // Create mixed cards with deck metadata
    const mixedCards = createMixedCards(selectedCards, allDecks);
    
    return { success: true, mixedCards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}