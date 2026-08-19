import React, { useState } from 'react';
import {
  ShoppingBag,
  Star,
  ExternalLink,
  Mail,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StoreItem, Language } from '../types';
import { translations } from '../translations';
import { AppStorage } from '../utils/storage';

interface StoreViewProps {
  currentLanguage: Language;
  items?: StoreItem[];
}

export const StoreView: React.FC<StoreViewProps> = ({ currentLanguage, items }) => {
  const t = translations[currentLanguage];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const storeItemsList = items || AppStorage.getStoreItems();

  const categories = [
    { id: 'ALL', label: t.category_all },
    { id: 'PROTECTION', label: t.category_protection },
    { id: 'CHARGING', label: t.category_charging },
    { id: 'CARE', label: t.category_care },
    { id: 'SAFETY', label: t.category_safety },
    { id: 'GADGETS', label: t.category_gadgets },
  ];

  const filteredItems = storeItemsList.filter((item) =>
    selectedCategory === 'ALL' ? true : item.category === selectedCategory
  );

  const handleEmailInquiry = (item: StoreItem) => {
    const subject = encodeURIComponent(`Inquiry: ${item.title.en} (EV Tracker Pakistan)`);
    const body = encodeURIComponent(
      `Hello EV Tracker Team,\n\nI would like to order or ask about "${item.title.en}" priced at PKR ${item.pricePkr.toLocaleString()}.\n\nMy Details:\nName: \nPhone Number: \nDelivery City: \nAddress: `
    );
    window.location.href = `mailto:evtrackerpk.support@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleAffiliateOrder = (item: StoreItem) => {
    if (item.affiliateUrl && item.affiliateUrl.startsWith('http')) {
      window.open(item.affiliateUrl, '_blank', 'noopener,noreferrer');
    } else if (item.affiliateUrl && item.affiliateUrl.startsWith('mailto:')) {
      window.location.href = item.affiliateUrl;
    } else {
      handleEmailInquiry(item);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                {t.store_title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t.store_sub}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <Truck className="w-4 h-4" />
            <span>{t.free_delivery_tag}</span>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No accessories found in this category</p>
          <p className="text-xs text-slate-500 mt-1">Check other categories or add items via Admin Portal</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const title = item.title[currentLanguage] || item.title.en;
            const desc = item.description[currentLanguage] || item.description.en;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Image & Tags */}
                  <div className="relative rounded-xl overflow-hidden aspect-video mb-3 bg-slate-950">
                    <img
                      src={item.imageUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover transition duration-300"
                    />
                    {item.isPopular && (
                      <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow">
                        Bestseller
                      </span>
                    )}
                    <span
                      className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm ${
                        item.inStock
                          ? 'bg-slate-950/80 text-emerald-400'
                          : 'bg-rose-950/80 text-rose-400'
                      }`}
                    >
                      {item.inStock ? t.in_stock : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Rating & Review */}
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.rating}</span>
                      <span className="text-slate-500 font-normal">({item.reviewCount})</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {item.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mb-1.5 leading-snug">
                    {title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {desc}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-1 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
                    {item.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        Rs. {item.pricePkr.toLocaleString()}
                      </span>
                      {item.originalPricePkr > item.pricePkr && (
                        <span className="text-xs text-slate-500 line-through font-mono">
                          Rs. {item.originalPricePkr.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.originalPricePkr > item.pricePkr && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Save {Math.round(((item.originalPricePkr - item.pricePkr) / item.originalPricePkr) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleEmailInquiry(item)}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-400" />
                      <span>Email Order</span>
                    </button>

                    <button
                      onClick={() => handleAffiliateOrder(item)}
                      className="py-2 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1"
                    >
                      <span>{item.affiliateUrl && item.affiliateUrl.includes('daraz') ? 'Daraz Store' : t.buy_on_affiliate}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
