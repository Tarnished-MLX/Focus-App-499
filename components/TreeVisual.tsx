import React from 'react';
import { TreeStage, TreeType } from '../types';

interface TreeVisualProps {
  stage: TreeStage;
  progress: number;
  type: TreeType;
}

const TreeVisual: React.FC<TreeVisualProps> = ({ stage, type }) => {
  
  // Colors based on Tree Type
  const getColors = () => {
    switch (type) {
      case 'SAKURA': return { trunk: '#5D4037', leafDark: '#EC4899', leafLight: '#F9A8D4', flower: '#FFF' };
      case 'PINE': return { trunk: '#3E2723', leafDark: '#1B5E20', leafLight: '#2E7D32', flower: '#EF4444' };
      case 'WILLOW': return { trunk: '#4E342E', leafDark: '#558B2F', leafLight: '#9CCC65', flower: '#FFEB3B' };
      default: return { trunk: '#795548', leafDark: '#2E7D32', leafLight: '#4CAF50', flower: 'pink' }; // OAK
    }
  };

  const c = getColors();

  // SVG Paths and shapes
  const renderTree = () => {
    switch (stage) {
      case TreeStage.SEED:
        return (
          <g transform="translate(100, 180)">
            <circle cx="0" cy="0" r="10" fill={c.trunk} />
            <path d="M-5 -5 Q 0 -15 5 -5" stroke={c.trunk} fill="none" strokeWidth="2" />
          </g>
        );
      case TreeStage.SPROUT:
        return (
          <g transform="translate(100, 180)">
             <path d="M0 0 Q 0 -20 -10 -30" stroke={c.leafLight} strokeWidth="4" fill="none" />
             <path d="M0 0 Q 0 -25 10 -35" stroke={c.leafLight} strokeWidth="4" fill="none" />
             <circle cx="-10" cy="-30" r="5" fill={c.leafDark} />
             <circle cx="10" cy="-35" r="5" fill={c.leafDark} />
          </g>
        );
      case TreeStage.SAPLING:
        return (
          <g transform="translate(100, 180)">
            <rect x="-5" y="-60" width="10" height="60" fill={c.trunk} rx="2" />
            <circle cx="-15" cy="-50" r="15" fill={c.leafLight} />
            <circle cx="15" cy="-60" r="18" fill={c.leafDark} />
            <circle cx="0" cy="-80" r="20" fill={c.leafLight} />
          </g>
        );
      case TreeStage.TREE:
      case TreeStage.FLOWERING:
      case TreeStage.FRUITING:
        if (type === 'PINE') {
            return (
                <g transform="translate(100, 180)">
                    <rect x="-10" y="-40" width="20" height="40" fill={c.trunk} />
                    <path d="M-60 -30 L0 -160 L60 -30 Z" fill={c.leafDark} />
                    <path d="M-50 -30 L0 -140 L50 -30 Z" fill={c.leafLight} transform="translate(0, -20)" />
                    {(stage === TreeStage.FRUITING) && (
                         <>
                           <circle cx="-20" cy="-60" r="6" fill="#EF4444" className="animate-bounce" />
                           <circle cx="20" cy="-80" r="6" fill="#EF4444" className="animate-bounce" style={{animationDelay: '0.3s'}} />
                         </>
                    )}
                </g>
            )
        }
        
        if (type === 'WILLOW') {
             return (
                 <g transform="translate(100, 180)">
                     {/* Trunk */}
                    <path d="M-5 0 L-10 -70 Q-30 -90 -10 -110" stroke={c.trunk} strokeWidth="10" fill="none" />
                    
                    {/* Hanging Branches */}
                    <path d="M-10 -100 Q -40 -80 -40 -20" stroke={c.leafLight} strokeWidth="4" fill="none" />
                    <path d="M-10 -100 Q 0 -80 0 -10" stroke={c.leafDark} strokeWidth="4" fill="none" />
                    <path d="M-10 -100 Q 30 -80 30 -30" stroke={c.leafLight} strokeWidth="4" fill="none" />
                    <path d="M-10 -100 Q 50 -70 50 -40" stroke={c.leafDark} strokeWidth="4" fill="none" />

                     {/* Fruits */}
                    {(stage === TreeStage.FRUITING) && (
                       <>
                         <circle cx="-40" cy="-20" r="6" fill="#EF4444" className="animate-bounce" />
                         <circle cx="30" cy="-30" r="6" fill="#EF4444" className="animate-bounce" style={{animationDelay: '0.2s'}} />
                       </>
                    )}
                 </g>
             )
        }

        // DEFAULT OAK / SAKURA Shape
        return (
          <g transform="translate(100, 180)">
            <path d="M-10 0 L-10 -80 Q-20 -100 -40 -110" stroke={c.trunk} strokeWidth="12" fill="none" />
            <path d="M10 0 L10 -80 Q20 -100 40 -110" stroke={c.trunk} strokeWidth="12" fill="none" />
            <rect x="-15" y="-90" width="30" height="90" fill={c.trunk} />
            
            {/* Leaves */}
            <circle cx="-40" cy="-110" r="35" fill={c.leafLight} />
            <circle cx="40" cy="-110" r="35" fill={c.leafLight} />
            <circle cx="0" cy="-140" r="45" fill={c.leafDark} />
            <circle cx="-25" cy="-90" r="30" fill={c.leafDark} />
            <circle cx="25" cy="-90" r="30" fill={c.leafDark} />

            {/* Flowers */}
            {(stage === TreeStage.FLOWERING || stage === TreeStage.FRUITING) && (
               <>
                 <circle cx="-30" cy="-120" r="5" fill={c.flower} className="animate-pulse" />
                 <circle cx="30" cy="-100" r="5" fill={c.flower} className="animate-pulse" />
                 <circle cx="0" cy="-150" r="5" fill={c.flower} className="animate-pulse" />
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