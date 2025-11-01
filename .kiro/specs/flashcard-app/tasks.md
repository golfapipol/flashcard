# Implementation Plan

- [x] 1. Set up core data models and utilities
  - Create TypeScript interfaces for Deck and Card models
  - Implement flashcard storage utilities for localStorage operations
  - Create CSV parser utility with validation
  - Create utility functions for ID generation, validation, and text sanitization
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

- [x] 2. Set up React application structure
  - [x] 2.1 Create main React application setup
    - Set up package.json with React, TypeScript, and Tailwind CSS dependencies
    - Create public/index.html and src/index.tsx entry points
    - Configure Tailwind CSS and basic styling
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 2.2 Create main App component with routing
    - Implement App.tsx with React Router setup
    - Add navigation structure for flashcard route
    - Create basic layout with consistent styling
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 3. Migrate from react-scripts to Vite
  - [x] 3.1 Update package.json dependencies
    - Remove react-scripts dependency
    - Add Vite and related plugins (@vitejs/plugin-react, vite)
    - Update TypeScript and other dev dependencies for Vite compatibility
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Create Vite configuration files
    - Create vite.config.ts with React plugin and TypeScript support
    - Update index.html to work with Vite (move to root, update script tags)
    - Configure Tailwind CSS to work with Vite
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.3 Update npm scripts and build process
    - Replace react-scripts commands with Vite equivalents
    - Update start, build, and preview scripts
    - Ensure TypeScript compilation works with Vite
    - _Requirements: 5.1, 5.2_

  - [x] 3.4 Create .gitignore file
    - Create .gitignore with appropriate exclusions for Node.js, Vite, and IDE files
    - Include build outputs, dependencies, and temporary files
    - _Requirements: 5.1, 5.2_

- [x] 4. Implement CSV import functionality
  - [x] 4.1 Create CSVImporter component with file input handling
    - Build file selection interface with drag-and-drop support
    - Integrate existing CSV parser with React component
    - Add validation UI for file format and content errors
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 4.2 Create deck creation dialog with name and color selection
    - Build modal dialog for deck configuration
    - Implement color picker with predefined palette from types
    - Add form validation for deck name and color selection
    - _Requirements: 2.1, 2.2_

  - [ ]* 4.3 Write unit tests for CSV import components
    - Test CSVImporter component with various file scenarios
    - Test deck creation dialog functionality
    - _Requirements: 1.1, 1.3, 2.1, 2.2_

- [x] 5. Build deck management interface
  - [x] 5.1 Create DeckManager component for deck listing
    - Display deck cards with names, colors, and card counts using existing storage utilities
    - Implement deck selection and deletion functionality
    - Add empty state when no decks exist
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [x] 5.2 Implement deck deletion with confirmation dialog
    - Create confirmation modal for deck deletion
    - Integrate with existing flashcardStorage.deleteDeck method
    - Handle state updates after deletion
    - _Requirements: 2.4_

  - [ ]* 5.3 Write unit tests for deck management operations
    - Test deck listing and selection functionality
    - Test confirmation dialog interactions
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 6. Create flashcard study interface
  - [x] 6.1 Build FlashCard component with flip animation
    - Implement card flip functionality with CSS transitions
    - Display front content by default and back content when flipped
    - Apply deck colors and name to card back using existing color constants
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 6.2 Create StudyInterface component for card navigation
    - Implement card navigation with next/previous controls
    - Add progress indicators showing current position in deck
    - Handle end-of-deck scenarios with restart options
    - Integrate with existing flashcardStorage.getCards method
    - _Requirements: 3.1, 3.5, 3.6_

  - [x] 6.3 Add keyboard shortcuts for study navigation
    - Implement spacebar for card flipping
    - Add arrow keys for navigation between cards
    - Include escape key to exit study mode
    - _Requirements: 3.3, 3.5_

  - [ ]* 6.4 Write unit tests for study interface components
    - Test card flipping and navigation functionality
    - Test keyboard shortcut handling
    - Test progress tracking and end-of-deck behavior
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [x] 7. Create main FlashcardApp component and routing
  - [x] 7.1 Create main FlashcardApp component
    - Build container component that manages routing between deck list and study mode
    - Implement state management for decks and current study session
    - Integrate with existing flashcardStorage utilities for data persistence
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.2 Add flashcard route to router configuration
    - Update App.tsx to include /flashcards route
    - Add navigation link to access flashcard application
    - Ensure consistent styling with existing application theme
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ]* 7.3 Write integration tests for complete flashcard workflow
    - Test end-to-end CSV import to deck creation flow
    - Test complete study session from deck selection to completion
    - Test data persistence using existing storage utilities
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.2_

- [x] 8. Implement manual flashcard creation functionality
  - [x] 8.1 Create CardEditor component for individual card editing
    - Build form interface with front and back content inputs
    - Add validation for required content on both sides
    - Implement card preview functionality to show how card will look
    - _Requirements: 1.5.3, 1.5.5_

  - [x] 8.2 Create ManualDeckCreator component for deck creation workflow
    - Build multi-step interface for deck name, color selection, and card creation
    - Implement add/edit/remove functionality for individual cards
    - Add validation to prevent saving empty decks
    - Integrate with existing flashcardStorage utilities for saving
    - _Requirements: 1.5.1, 1.5.2, 1.5.4, 1.5.6_

  - [x] 8.3 Update DeckManager to include manual creation option
    - Add "Create Manual Deck" button alongside CSV import
    - Integrate ManualDeckCreator component into deck management flow
    - Ensure consistent UI/UX with existing CSV import workflow
    - _Requirements: 1.5.1, 1.5.6_

  - [ ]* 8.4 Write unit tests for manual card creation components
    - Test CardEditor validation and preview functionality
    - Test ManualDeckCreator workflow and state management
    - Test integration with existing storage utilities
    - _Requirements: 1.5.1, 1.5.2, 1.5.3, 1.5.4, 1.5.5_

- [x] 9. Implement responsive design and accessibility
  - [x] 9.1 Add responsive layouts for mobile devices
    - Optimize deck list layout for mobile screens using Tailwind CSS
    - Ensure flashcards are properly sized on touch devices
    - Implement touch gestures for card flipping and navigation
    - _Requirements: 5.1, 5.2_

  - [x] 9.2 Implement accessibility features
    - Add proper ARIA labels and roles for screen readers
    - Ensure keyboard navigation works throughout the application
    - Implement focus management for modal dialogs
    - _Requirements: 5.3, 5.4, 5.5_

  - [ ]* 9.3 Write accessibility and responsive design tests
    - Test keyboard navigation and screen reader compatibility
    - Test responsive layouts on various screen sizes
    - Test touch interactions on mobile devices
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Add error handling and loading states
  - [x] 10.1 Implement comprehensive error handling
    - Add error boundaries for component error recovery
    - Integrate with existing flashcardStorage error handling for localStorage issues
    - Display user-friendly error messages for all failure scenarios
    - _Requirements: 4.3, 4.4_

  - [x] 10.2 Add loading states and user feedback
    - Implement loading indicators for CSV processing using existing CSV parser
    - Add success messages for deck creation and deletion
    - Show appropriate feedback for all user actions
    - _Requirements: 1.4, 5.5_

  - [ ]* 10.3 Write tests for error handling and edge cases
    - Test error boundary functionality
    - Test localStorage failure scenarios using existing storage utilities
    - Test user feedback and loading state displays
    - _Requirements: 4.3, 4.4, 5.5_

- [x] 11. Implement card mixing functionality
  - [x] 11.1 Create card mixing utility functions
    - Implement Fisher-Yates shuffle algorithm for random card selection
    - Create function to combine cards from multiple decks
    - Add utility to calculate grid layout based on card count
    - Create MixedCard interface implementation with deck metadata
    - _Requirements: 5.1, 5.5, 5.7_

  - [x] 11.2 Create CardMixer component for deck selection
    - Build interface with checkboxes for multiple deck selection
    - Add input field for specifying number of cards to draw
    - Implement validation to prevent requesting more cards than available
    - Add visual feedback for selected decks and card count limits
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 11.3 Create MixedCardDisplay component for tarot-like layout
    - Implement responsive grid layout for mixed cards
    - Display cards with deck identification (color and name)
    - Add individual card flip functionality within the grid
    - Include reshuffle and navigation options
    - _Requirements: 5.6, 5.7, 5.8, 5.9_

  - [x] 11.4 Integrate card mixing into main FlashcardApp navigation
    - Add "Mix Cards" option to main deck management interface
    - Implement routing between deck selection, card mixing, and mixed display
    - Update FlashcardApp state management to handle mixing sessions
    - Ensure consistent navigation flow with existing study interface
    - _Requirements: 5.1, 5.9_

  - [x] 11.5 Add card mixing session persistence
    - Extend flashcardStorage to save recent mixing sessions
    - Implement quick access to previous mixing configurations
    - Add option to save favorite mixing combinations
    - Handle storage cleanup for old mixing sessions
    - _Requirements: 5.1, 5.9_

  - [ ]* 11.6 Write unit tests for card mixing functionality
    - Test shuffle algorithm and random selection utilities
    - Test CardMixer component validation and deck selection
    - Test MixedCardDisplay grid layout and card interactions
    - Test mixing session persistence and retrieval
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_