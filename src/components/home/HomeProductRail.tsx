type RailProduct = {
  name: string;
  detail: string;
  price: string;
  tag?: string;
  image: string;
};

type HomeProductRailProps = {
  title: string;
  subtitle: string;
  products: RailProduct[];
};

export default function HomeProductRail({ title, subtitle, products }: HomeProductRailProps) {
  return (
    <section className="rounded-[28px] border border-[#e8eadf] bg-white p-5 shadow-[0_18px_50px_rgba(34,45,31,0.07)]">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#152015]">{title}</h2>
          <p className="text-sm text-[#6a735f]">{subtitle}</p>
        </div>
        <button type="button" className="text-sm font-bold text-[#2f6b3f]">View all</button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((product) => (
          <article
            key={product.name}
            className="min-w-[154px] overflow-hidden rounded-3xl border border-[#e8eadf] bg-[#fffdf8] transition hover:-translate-y-1 hover:shadow-md sm:min-w-[180px]"
          >
            <div className="relative aspect-square bg-[#f5faf2]">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
              {product.tag && (
                <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold text-[#2f6b3f] shadow-sm">
                  {product.tag}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="truncate text-sm font-bold text-[#152015]">{product.name}</h3>
              <p className="mt-1 text-xs text-[#6a735f]">{product.detail}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-bold text-[#8a6400]">{product.price}</span>
                <button type="button" className="rounded-full border border-[#2f6b3f] px-3 py-1 text-xs font-bold text-[#2f6b3f]">
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
