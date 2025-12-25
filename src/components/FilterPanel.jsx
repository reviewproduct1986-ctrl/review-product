import React from 'react';
import { Filter, X } from 'lucide-react';

export default function FilterPanel({
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  selectedBadges,
  setSelectedBadges,
  availableBadges
}) {
  const toggleBadge = (badge) => {
    setSelectedBadges(prev =>
      prev.includes(badge)
        ? prev.filter(b => b !== badge)
        : [...prev, badge]
    );
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-violet-200 rounded-xl font-semibold text-violet-600 hover:bg-violet-50 transition-all"
        >
          <Filter size={18} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`
        lg:block bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto
        ${showFilters ? 'block' : 'hidden'}
      `}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Filter size={20} className="text-violet-600" />
            Filters
          </h3>
          {showFilters && (
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Price Range */}
          <div className="pb-6 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Price Range
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pb-6 border-b border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    minRating === rating
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Filter */}
          {availableBadges.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableBadges.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(badge)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedBadges.includes(badge)
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(minRating > 0 || priceRange[1] < 500 || selectedBadges.length > 0) && (
            <button
              onClick={() => {
                setMinRating(0);
                setPriceRange([0, 500]);
                setSelectedBadges([]);
              }}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </>
  );
}
