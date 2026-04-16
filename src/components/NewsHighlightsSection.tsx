type NewsTag = {
  label: string;
  href: string;
};

export type NewsHighlightItem = {
  title: string;
  href: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  publishedLabel: string;
  tags?: NewsTag[];
};

type NewsHighlightsSectionProps = {
  title?: string;
  viewAllHref: string;
  viewAllLabel?: string;
  items: NewsHighlightItem[];
  className?: string;
};

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1 mt-1 h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

function NewsHighlightsSection({
  title = 'Notícias',
  viewAllHref,
  viewAllLabel = 'Ver tudo',
  items,
  className = 'col-span-2 lg:col-span-1 z-10'
}: NewsHighlightsSectionProps) {
  return (
    <section className={className}>
      <div className="pl-3">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-black xl:text-4xl 2xl:text-5xl">
          {title}
        </h2>
        <a
          href={viewAllHref}
          className="ml-1 mt-1 flex items-center text-sm text-gray-500 underline-offset-2 hover:underline"
        >
          <span>{viewAllLabel}</span>
          <ArrowIcon />
        </a>
      </div>

      <div className="z-10 mt-2 sm:mt-4">
        {items.map((item) => (
          <article
            key={item.href}
            className="group relative overflow-hidden border-b-2 border-gray-200 p-3.5"
          >
            <div className="absolute inset-0 z-20 hidden group-hover:block">
              <img
                className="pointer-events-none z-10 aspect-[16/9] w-full object-cover"
                src={item.image}
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
              />
              <span className="absolute inset-0 z-10 h-full w-full bg-black bg-opacity-70" />
            </div>

            <div className="relative z-30">
              <time
                className="text-sm font-semibold uppercase text-orange-400"
                dateTime={item.publishedAt}
              >
                {item.publishedLabel}
              </time>

              <p className="mt-2 text-md font-bold transition underline-offset-2 group-hover:text-white group-hover:underline lg:text-lg xl:text-xl 2xl:text-2xl">
                <a href={item.href}>{item.title}</a>
              </p>

              <p className="mt-1 line-clamp-2 transition group-hover:text-white">
                <a href={item.href}>{item.excerpt}</a>
              </p>

              {item.tags && item.tags.length > 0 ? (
                <div className="mt-2 flex items-center space-x-3 text-sm text-gray-600 transition group-hover:text-white">
                  {item.tags.map((tag) => (
                    <a key={tag.href} href={tag.href} className="underline-offset-2 hover:underline">
                      {tag.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default NewsHighlightsSection;
