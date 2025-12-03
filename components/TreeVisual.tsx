import React from 'react';
import { TreeStage } from '../types';

interface TreeVisualProps {
  stage: TreeStage;
  progress: number;
}

const TreeVisual: React.FC<TreeVisualProps> = ({ stage }) => {
  // SVG Paths and shapes
  const renderTree = () => {
    switch (stage) {
      case TreeStage.SEED:
        return (
          <g transform="translate(100, 180)">
            <circle cx="0" cy="0" r="10" fill="#5D4037" />
            <path d="M-5 -5 Q 0 -15 5 -5" stroke="#8D6E63" fill="none" strokeWidth="2" />
          </g>
        );
      case TreeStage.SPROUT:
        return (
          <g transform="translate(100, 180)">
             <path d="M0 0 Q 0 -20 -10 -30" stroke="#66BB6A" strokeWidth="4" fill="none" />
             <path d="M0 0 Q 0 -25 10 -35" stroke="#66BB6A" strokeWidth="4" fill="none" />
             <circle cx="-10" cy="-30" r="5" fill="#4CAF50" />
             <circle cx="10" cy="-35" r="5" fill="#4CAF50" />
          </g>
        );
      case TreeStage.SAPLING:
        return (
          <g transform="translate(100, 180)">
            <rect x="-5" y="-60" width="10" height="60" fill="#795548" rx="2" />
            <circle cx="-15" cy="-50" r="15" fill="#4CAF50" />
            <circle cx="15" cy="-60" r="18" fill="#43A047" />
            <circle cx="0" cy="-80" r="20" fill="#66BB6A" />
          </g>
        );
      case TreeStage.TREE:
      case TreeStage.FLOWERING:
      case TreeStage.FRUITING:
        return (
          <g transform="translate(100, 180)">
            <path d="M-10 0 L-10 -80 Q-20 -100 -40 -110" stroke="#5D4037" strokeWidth="12" fill="none" />
            <path d="M10 0 L10 -80 Q20 -100 40 -110" stroke="#5D4037" strokeWidth="12" fill="none" />
            <rect x="-15" y="-90" width="30" height="90" fill="#795548" />
            
            {/* Leaves */}
            <circle cx="-40" cy="-110" r="35" fill="#43A047" />
            <circle cx="40" cy="-110" r="35" fill="#43A047" />
            <circle cx="0" cy="-140" r="45" fill="#66BB6A" />
            <circle cx="-25" cy="-90" r="30" fill="#2E7D32" />
            <circle cx="25" cy="-90" r="30" fill="#2E7D32" />

            {/* Flowers */}
            {(stage === TreeStage.FLOWERING || stage === TreeStage.FRUITING) && (
               <>
                 <circle cx="-30" cy="-120" r="5" fill="pink" className="animate-pulse" />
                 <circle cx="30" cy="-100" r="5" fill="pink" className="animate-pulse" />
                 <circle cx="0" cy="-150" r="5" fill="white" className="animate-pulse" />
               </>
            )}

            {/* Fruits - Only if FRUITING or Completed */}
            {stage === TreeStage.FRUITING && (
               <>
                 <circle cx="-40" cy="-110" r="8" fill="#EF4444" className="animate-bounce" />
                 <circle cx="40" cy="-120" r="8" fill="#EF4444" className="animate-bounce" style={{animationDelay: '0.2s'}} />
                 <circle cx="0" cy="-130" r="8" fill="#EF4444" className="animate-bounce" style={{animationDelay: '0.4s'}} />
               </>
            )}
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 h-64 relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">
        {/* Ground */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="#A1887F" opacity="0.5" />
        {renderTree()}
      </svg>
    </div>
  );
};

export default TreeVisual;
