import React from 'react';
import { FruitReward } from '../types';
import { Apple, Citrus, Cherry, Grape } from 'lucide-react'; // Simulating fruit icons

interface GardenViewProps {
  rewards: FruitReward[];
  onBack: () => void;
}

const GardenView: React.FC<GardenViewProps> = ({ rewards, onBack }) => {
  return (
    <div className="absolute inset-0 bg-sky-100 z-50 flex flex-col p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-800">My Fruit Garden 🍎</h2>
        <button 
          onClick={onBack}
          className="bg-white px-4 py-2 rounded-xl shadow-sm text-green-700 font-semibold hover:bg-green-50 transition-colors"
        >
          Back to Timer
        </button>
      </div>

      {rewards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
          <p className="text-6xl mb-4">🧺</p>
          <p className="text-xl">Your garden is empty!</p>
          <p>Complete a focus session to grow your first fruit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center text-center border-b-4 border-green-200">
              <div className="text-4xl mb-2 wiggle">
                {reward.type === 'APPLE' && '🍎'}
                {reward.type === 'ORANGE' && '🍊'}
                {reward.type === 'LEMON' && '🍋'}
                {reward.type === 'CHERRY' && '🍒'}
                {reward.type === 'BLUEBERRY' && '🫐'}
              </div>
              <p className="font-bold text-slate-700 capitalize">{reward.type.toLowerCase()}</p>
              <p className="text-xs text-slate-400 mt-1">{reward.subject}</p>
              {reward.fact && (
                <div className="mt-2 bg-green-50 p-2 rounded-lg text-xs text-green-800 italic">
                  "{reward.fact}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GardenView;
