import { NasaSearchClient } from '@/components/nasa/nasa-search-client';

export default function ExplorePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <NasaSearchClient />
    </section>
  );
}
