import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Affiliate Disclosure */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-violet-400">ⓘ</span> Affiliate Disclosure
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            GetProductOpinion.com participates in various affiliate marketing programs, which means we may earn 
            commissions on purchases made through our links to retailer sites. These commissions come at no 
            additional cost to you. We only recommend products we genuinely believe in, and our editorial content 
            is not influenced by affiliate partnerships. When you click on links to products and make a purchase, 
            we may receive a commission that helps support our site. Thank you for your support!
          </p>
        </div>

        {/* Site Info */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <p className="font-bold text-white text-lg">
              GetProductOpinion.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Expert product curation and unbiased reviews © 2024
          </p>
        </div>
      </div>
    </footer>
  );
}