/**
 * Core data models for the flashcard application
 */

export interface Deck {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  cardCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: Date;
}

/**
 * Predefined color palette for deck customization
 */
export const DECK_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
] as const;

export type DeckColor = typeof DECK_COLORS[number];

/**
 * Storage schema for localStorage
 */
export interface FlashcardStorage {
  decks: Record<string, Deck>;
  cards: Record<string, Card[]>; // Keyed by deckId
  mixingSessions: CardMixingSession[]; // Recent mixing sessions
  version: string;
}

/**
 * Mixed card interface for card mixing functionality
 */
export interface MixedCard extends Card {
  deckName: string;
  deckColor: string;
  position: number; // Position in the mixed layout
}

/**
 * Card mixing session interface
 */
export interface CardMixingSession {
  id: string;
  selectedDeckIds: string[];
  cardCount: number;
  timestamp: Date;
}

/**
 * Grid layout configuration
 */
export interface GridLayout {
  rows: number;
  cols: number;
}

/**
 * CSV import result interface
 */
export interface CSVImportResult {
  success: boolean;
  cards?: Omit<Card, 'id' | 'deckId' | 'createdAt'>[];
  error?: string;
  rowCount?: number;
}