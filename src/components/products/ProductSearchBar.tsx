import { useState } from "react";
import { Search, X } from "lucide-react";
import type { Product } from "../../types/product";
import ProductSearchSuggestions from "./ProductSearchSuggestions";

type ProductSearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: Product[];
  onSelectProduct: (product: Product) => void;
};

export default function ProductSearchBar({
  query,
  onQueryChange,
  suggestions,
  onSelectProduct,
}: ProductSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6a735f]" />
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search milk, ghee, A2, organic..."
        className="h-12 w-full rounded-2xl border border-[#d9dccf] bg-white/85 pl-12 pr-12 text-sm font-semibold text-[#18251b] shadow-[0_14px_34px_rgba(34,45,31,0.07)] outline-none transition focus:border-[#88a75f] focus:ring-4 focus:ring-[#dceecf]"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#6a735f] transition hover:bg-[#eef5e8]"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isFocused && (
        <ProductSearchSuggestions
          query={query}
          suggestions={suggestions}
          onSelectProduct={onSelectProduct}
        />
      )}
    </div>
  );
}
