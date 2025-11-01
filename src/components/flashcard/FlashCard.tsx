import React from 'react';
import { Card } from '../../types/flashcard';

interface FlashCardProps {
  card: Card;
  deckName: string;
  deckColor: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  deckName,
  deckColor,
  isFlipped,
  onFlip
}) => {
  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div
        className={`relative w-full h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={onFlip}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-lg border border-gray-200 bg-white flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 leading-relaxed">
              {card.front}
            </p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-lg border border-gray-200 flex flex-col p-6"
          style={{ backgroundColor: deckColor }}
        >
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg font-medium text-white leading-relaxed text-center">
              {card.back}
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-white opacity-90">
              {deckName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};