# Flashcard Application Design Document

## Overview

The flashcard application.
It will provide a complete flashcard study system with CSV import capabilities, deck management, and an interactive card study interface. The application leverages the existing React, TypeScript, and Tailwind CSS infrastructure while adding new components and utilities specific to flashcard functionality.

## Architecture

### High-Level Architecture

The flashcard application follows a component-based architecture with clear separation of concerns:

- **Presentation Layer**: React components for UI rendering and user interactions
- **State Management**: React hooks and context for local state management
- **Data Layer**: Local storage utilities for persistence
- **Business Logic**: Custom hooks and utilities for flashcard operations

### Integration with Existing Application

The flashcard feature will be added as a new route (`/flashcards`) in the existing router configuration, maintaining consistency with the current navigation pattern.

## Components and Interfaces

### Core Components

#### 1. FlashcardApp Component
- **Purpose**: Main container component for the flashcard application
- **Responsibilities**: Route management, global state initialization
- **Props**: None (route-level component)

#### 2. DeckManager Component
- **Purpose**: Manages deck creation, listing, and deletion
- **Responsibilities**: 
  - Display deck list with names, colors, and card counts
  - Handle CSV import and deck creation
  - Provide deck deletion functionality
- **Props**: 
  ```typescript
  interface DeckManagerProps {
    decks: Deck[]
    onCreateDeck: (deck: Omit<Deck, 'id'>) => void
    onDeleteDeck: (deckId: string) => void
    onSelectDeck: (deckId: string) => void
  }
  ```

#### 3. CSVImporter Component
- **Purpose**: Handles CSV file selection and parsing
- **Responsibilities**:
  - File input handling
  - CSV parsing and validation
  - Error display for invalid files
- **Props**:
  ```typescript
  interface CSVImporterProps {
    onImport: (cards: Omit<Card, 'id'>[], deckName: string, deckColor: string) => void
    onError: (error: string) => void
  }
  ```

#### 3.5. ManualDeckCreator Component
- **Purpose**: Handles manual creation of flashcard decks without CSV import
- **Responsibilities**:
  - Provide form for deck name and color selection
  - Allow adding/editing/removing individual cards
  - Validate card content before saving
  - Manage temporary card state during creation
- **Props**:
  ```typescript
  interface ManualDeckCreatorProps {
    onCreateDeck: (cards: Omit<Card, 'id'>[], deckName: string, deckColor: string) => void
    onCancel: () => void
  }
  ```

#### 3.6. CardEditor Component
- **Purpose**: Individual card editing interface for manual creation
- **Responsibilities**:
  - Provide input fields for front and back content
  - Validate card content
  - Handle card preview functionality
- **Props**:
  ```typescript
  interface CardEditorProps {
    card?: { front: string; back: string }
    onSave: (card: { front: string; back: string }) => void
    onCancel: () => void
    isEditing?: boolean
  }
  ```

#### 4. StudyInterface Component
- **Purpose**: Main study interface for flashcard interaction
- **Responsibilities**:
  - Display current card with flip animation
  - Handle navigation between cards
  - Show progress indicators
- **Props**:
  ```typescript
  interface StudyInterfaceProps {
    deck: Deck
    cards: Card[]
    onExit: () => void
  }
  ```

#### 5. FlashCard Component
- **Purpose**: Individual flashcard with flip functionality
- **Responsibilities**:
  - Display front/back content
  - Handle flip animations
  - Apply deck colors and styling
- **Props**:
  ```typescript
  interface FlashCardProps {
    card: Card
    deckName: string
    deckColor: string
    isFlipped: boolean
    onFlip: () => void
  }
  ```

### Data Models

#### Deck Interface
```typescript
interface Deck {
  id: string
  name: string
  color: string
  createdAt: Date
  cardCount: number
}
```

#### Card Interface
```typescript
interface Card {
  id: string
  deckId: string
  front: string
  back: string
  createdAt: Date
}
```

#### Color Palette
```typescript
const DECK_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
] as const
```

## Data Models

### Storage Schema

The application uses localStorage with the following structure:

```typescript
interface FlashcardStorage {
  decks: Record<string, Deck>
  cards: Record<string, Card[]> // Keyed by deckId
  version: string
}
```

### CSV Format

Expected CSV format for import:
- First column: Front of card (question/prompt)
- Second column: Back of card (answer/explanation)
- Additional columns: Ignored
- First row: Can be headers (will be detected and skipped if non-content)

## Error Handling

### CSV Import Errors
- **Invalid file format**: Display user-friendly error message
- **Empty file**: Prompt user to select a valid file
- **Missing columns**: Show specific validation error
- **Parsing errors**: Graceful fallback with error details

### Manual Card Creation Errors
- **Empty card content**: Validate that both front and back have content
- **Duplicate cards**: Warn user about potential duplicate content
- **Empty deck**: Prevent saving decks with no cards
- **Invalid deck name**: Validate deck name length and characters

### Storage Errors
- **localStorage unavailable**: Display warning and continue with session-only storage
- **Storage quota exceeded**: Prompt user to delete old decks
- **Corrupted data**: Reset to clean state with user confirmation

### Navigation Errors
- **Invalid deck selection**: Redirect to deck list with error message
- **Missing cards**: Handle empty deck state gracefully

## Testing Strategy

### Unit Testing
- **Component Testing**: Test individual components with React Testing Library
- **Utility Testing**: Test CSV parsing, storage utilities, and data transformations
- **Hook Testing**: Test custom hooks for state management and side effects

### Integration Testing
- **CSV Import Flow**: End-to-end testing of file selection through deck creation
- **Study Session Flow**: Complete user journey from deck selection to card study
- **Storage Integration**: Test data persistence and retrieval

### Test Files Structure
```
src/components/flashcard/__tests__/
├── FlashcardApp.test.tsx
├── DeckManager.test.tsx
├── CSVImporter.test.tsx
├── StudyInterface.test.tsx
└── FlashCard.test.tsx

src/lib/__tests__/
├── flashcardStorage.test.ts
├── csvParser.test.ts
└── flashcardUtils.test.ts
```

### Accessibility Testing
- **Keyboard Navigation**: Ensure all interactions work with keyboard only
- **Screen Reader Support**: Test with screen reader software
- **Color Contrast**: Verify all color combinations meet WCAG guidelines
- **Focus Management**: Test focus flow and visual indicators

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load cards only when deck is selected
- **Memoization**: Use React.memo for expensive components
- **Virtual Scrolling**: For large deck lists (if needed)
- **Debounced Search**: If search functionality is added

### Memory Management
- **Card Cleanup**: Remove unused card data from memory
- **Image Optimization**: If card images are supported in future
- **Storage Limits**: Monitor localStorage usage

## Security Considerations

### Data Validation
- **CSV Sanitization**: Prevent XSS through malicious CSV content
- **Input Validation**: Validate all user inputs before storage
- **File Type Validation**: Ensure only CSV files are processed

### Privacy
- **Local Storage Only**: No data transmitted to external servers
- **Data Encryption**: Consider encrypting sensitive study materials
- **Clear Data Option**: Provide way to completely clear all data