import React, { useState, useRef } from 'react';
import { Card } from '../../types/flashcard';

interface FlashCardProps {
  card: Card;
  deckName: string;
  deckColor: string;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  deckName,
  deckColor,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Minimum distance for a swipe
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    // Only handle horizontal swipes
    if (!isVerticalSwipe) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  const handleClick = () => {
    // Prevent click if it was part of a swipe gesture
    if (touchStart && touchEnd) {
      const distanceX = Math.abs(touchStart.x - touchEnd.x);
      const distanceY = Math.abs(touchStart.y - touchEnd.y);
      if (distanceX > 10 || distanceY > 10) {
        return;
      }
    }
    onFlip();
  };

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div
        ref={cardRef}
        className={`relative w-full h-64 sm:h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${card.front}. ${isFlipped ? 'Showing answer' : 'Press Enter or Space to reveal answer'}`}
        aria-pressed={isFlipped}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg border border-gray-200 bg-white flex items-center justify-center p-4 sm:p-6"
          aria-hidden={isFlipped}
        >
          <div className="text-center w-full">
            <p className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed break-words">
              {card.front}
            </p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-lg border border-gray-200 flex flex-col p-4 sm:p-6"
          style={{ backgroundColor: deckColor }}
          aria-hidden={!isFlipped}
        >
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base sm:text-lg font-medium text-white leading-relaxed text-center break-words">
              {card.back}
            </p>
          </div>
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs sm:text-sm font-semibold text-white opacity-90">
              {deckName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Touch gesture hints for mobile */}
      <div className="mt-4 text-center text-xs text-gray-500 sm:hidden">
        <span className="inline-block mx-2">Tap to flip</span>
        {(onSwipeLeft || onSwipeRight) && (
          <span className="inline-block mx-2">Swipe to navigate</span>
        )}
      </div>
    </div>
  );
};