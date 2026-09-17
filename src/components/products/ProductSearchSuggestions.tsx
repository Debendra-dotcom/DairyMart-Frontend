import { Search } from "lucide-react";
import type { Product } from "../../types/product";

type ProductSearchSuggestionsProps = {
  query: string;
  suggestions: Product[];
  onSelectProduct: (product: Product) => void;
};

export default function ProductSearchSuggestions({
  query,
  suggestions,
  onSelectProduct,
}: ProductSearchSuggestionsProps) {
  if (!query.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-[#e1dccb] bg-white shadow-[0_18px_44px_rgba(34,45,31,0.14)]">
      {suggestions.length > 0 ? (
        <div className="max-h-80 overflow-y-auto p-2">
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelectProduct(product)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f5f8ef]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-12 w-12 flex-none rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-[#18251b]">{product.name}</span>
                <span className="block truncate text-xs font-semibold text-[#6a735f]">
                  {product.variant} · {product.category}
                </span>
              </span>
              <span className="text-sm font-black text-[#d4a843]">₹{product.price}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-5 text-sm font-semibold text-[#6a735f]">
          <Search className="h-4 w-4 text-[#b7a77d]" />
          No products found
        </div>
      )}
    </div>
  );
}
