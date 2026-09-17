type ProductTile = {
  name: string;
  detail: string;
  price: string;
  image: string;
};

const frequentlyBought: ProductTile[] = [
  { name: "Full Cream Milk", detail: "1L daily pack", price: "₹65", image: "/full-cream-milk-1L.jpg" },
  { name: "Fresh Curd", detail: "400g family cup", price: "₹45", image: "/fresh-curd-400.jpg" },
  { name: "Paneer", detail: "200g fresh block", price: "₹95", image: "/paneer-200.jpg" },
];

const aiRecommended: ProductTile[] = [
  { name: "Sweet Lassi", detail: "Based on your dairy picks", price: "₹35", image: "/sweet-lassi.jpg" },
  { name: "Cheese Spread", detail: "Breakfast pairing", price: "₹130", image: "/cheese-spread.jpg" },
  { name: "Masala Chaas", detail: "Great with lunch", price: "₹30", image: "/masala-chaas.jpg" },
];

const flashDeals: ProductTile[] = [
  { name: "White Butter", detail: "Today only", price: "₹55", image: "/white-butter-100.jpg" },
  { name: "Pure Ghee", detail: "Save 10%", price: "₹160", image: "/pure-ghee-200.jpg" },
  { name: "Shrikhand", detail: "Weekend treat", price: "₹90", image: "/shrikhand.jpg" },
];

function ProductSection({ title, subtitle, products }: { title: string; subtitle: string; products: ProductTile[] }) {
  return (
    <section className="bg-white border border-[#e9eadf] rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#18251b]">{title}</h2>
        <p className="text-sm text-[#667064]">{subtitle}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {products.map((product) => (
          <article key={product.name} className="rounded-2xl border border-[#e9eadf] overflow-hidden bg-[#fffdf7]">
            <div className="aspect-square bg-[#f7fbf4]">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-[#18251b] truncate">{product.name}</h3>
              <p className="mt-1 text-xs text-[#667064]">{product.detail}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-bold text-[#936000]">{product.price}</span>
                <button type="button" className="rounded-lg border border-[#2f6b3f] px-3 py-1 text-xs font-bold text-[#2f6b3f]">
                  Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ProfileProductSections() {
  return (
    <div className="grid gap-5">
      <ProductSection title="Frequently bought" subtitle="Your regular dairy essentials." products={frequentlyBought} />
      <ProductSection title="AI recommended" subtitle="Mock picks based on your taste." products={aiRecommended} />
      <ProductSection title="Flash deals" subtitle="Limited-time dairy offers." products={flashDeals} />
    </div>
  );
}
