import React from 'react';
import { Search, Sparkles } from 'lucide-react';

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and Search */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-slate-900 text-lg">
                GetProductOpinion.
              </h1>
              <p className="text-xs text-slate-500">Expert Recommendations</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
