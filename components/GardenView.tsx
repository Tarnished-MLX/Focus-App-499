import React, { useState } from 'react';
import { FruitReward, TreeType } from '../types';
import { ShoppingBag, Coins, Sprout, ArrowRight } from 'lucide-react'; 

interface GardenViewProps {
  rewards: FruitReward[];
  seeds: number;
  unlockedTrees: TreeType[];
  selectedTree: TreeType;
  onBack: () => void;
  onSellFruit: (id: string, value: number) => void;
  onBuyTree: (tree: TreeType, cost: number) => void;
  onSelectTree: (tree: TreeType) => void;
}

const TREE_COSTS: Record<TreeType, number> = {
    'OAK': 0,
    'PINE': 100,
    'SAKURA': 250,
    'WILLOW': 500
};

const GardenView: React.FC<GardenViewProps> = ({ 
    rewards, seeds, unlockedTrees, selectedTree, 
    onBack, onSellFruit, onBuyTree, onSelectTree 
}) => {
  const [activeTab, setActiveTab] = useState<'GARDEN' | 'SHOP'>('GARDEN');

  const getFruitValue = (type: string) => {
    switch(type) {
        case 'BLUEBERRY': return 5;
        case 'CHERRY': return 10;
        case 'LEMON': return 15;
        case 'ORANGE': return 20;
        case 'APPLE': return 25;
        default: return 5;
    }
  };

  return (
    <div className="absolute inset-0 bg-sky-100 dark:bg-slate-900 z-50 flex flex-col p-6 overflow-hidden transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-400">
                {activeTab === 'GARDEN' ? 'My Garden' : 'Seed Shop'}
            </h2>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold mt-1">
                <Coins size={18} /> {seeds} Seeds
            </div>
        </div>
        <button 
          onClick={onBack}
          className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm text-green-700 dark:text-green-400 font-semibold hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button 
            onClick={() => setActiveTab('GARDEN')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${activeTab === 'GARDEN' ? 'bg-green-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
        >
            My Fruits
        </button>
        <button 
            onClick={() => setActiveTab('SHOP')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${activeTab === 'SHOP' ? 'bg-amber-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
        >
            Tree Shop
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        
        {activeTab === 'GARDEN' && (
            <>
                {rewards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-slate-500 mt-20">
                    <p className="text-6xl mb-4">🧺</p>
                    <p className="text-xl">Your garden is empty!</p>
                    <p>Focus to grow fruits.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center border-b-4 border-green-200 dark:border-green-900 relative group">
                            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                                {reward.type === 'APPLE' && '🍎'}
                                {reward.type === 'ORANGE' && '🍊'}
                                {reward.type === 'LEMON' && '🍋'}
                                {reward.type === 'CHERRY' && '🍒'}
                                {reward.type === 'BLUEBERRY' && '🫐'}
                            </div>
                            <p className="font-bold text-slate-700 dark:text-slate-200 capitalize text-sm">{reward.type.toLowerCase()}</p>
                            
                            <button 
                                onClick={() => onSellFruit(reward.id, getFruitValue(reward.type))}
                                className="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1 transition-colors w-full justify-center"
                            >
                                Sell <ArrowRight size={10}/> <Coins size={10}/> {getFruitValue(reward.type)}
                            </button>
                        </div>
                    ))}
                    </div>
                )}
            </>
        )}

        {activeTab === 'SHOP' && (
            <div className="space-y-4">
                {(Object.keys(TREE_COSTS) as TreeType[]).map(tree => {
                    const isUnlocked = unlockedTrees.includes(tree);
                    const isSelected = selectedTree === tree;
                    const cost = TREE_COSTS[tree];
                    
                    return (
                        <div key={tree} className={`p-4 rounded-2xl flex items-center justify-between border-2 ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl">
                                    {tree === 'OAK' && '🌳'}
                                    {tree === 'PINE' && '🌲'}
                                    {tree === 'SAKURA' && '🌸'}
                                    {tree === 'WILLOW' && '🌿'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg dark:text-white capitalize">{tree.toLowerCase()} Tree</h3>
                                    {!isUnlocked && <p className="text-amber-600 text-sm font-bold flex items-center gap-1"><Coins size={12}/> {cost} Seeds</p>}
                                    {isUnlocked && <p className="text-green-600 dark:text-green-400 text-xs font-bold">Owned</p>}
                                </div>
                            </div>

                            {isUnlocked ? (
                                <button 
                                    onClick={() => onSelectTree(tree)}
                                    disabled={isSelected}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm ${isSelected ? 'bg-green-500 text-white cursor-default' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                                >
                                    {isSelected ? 'Active' : 'Equip'}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onBuyTree(tree, cost)}
                                    disabled={seeds < cost}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1 ${seeds >= cost ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                >
                                    <ShoppingBag size={14} /> Buy
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        )}

      </div>
    </div>
  );
};

export default GardenView;