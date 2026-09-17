import { ChevronDown } from "lucide-react";
import type { ProductCategoryOption } from "../../types/product";

type ProductCategoryDropdownProps = {
  categories: ProductCategoryOption[];
  value: string;
  onChange: (category: string) => void;
};

export default function ProductCategoryDropdown({
  categories,
  value,
  onChange,
}: ProductCategoryDropdownProps) {
  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">Product category</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-2xl border border-[#d9dccf] bg-white/85 px-4 pr-11 text-sm font-black text-[#18251b] shadow-[0_14px_34px_rgba(34,45,31,0.07)] outline-none transition focus:border-[#88a75f] focus:ring-4 focus:ring-[#dceecf]"
      >
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a735f]" />
    </label>
  );
}
