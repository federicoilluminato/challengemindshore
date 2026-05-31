import { NasaResultCard } from '@/components/nasa/nasa-result-card';
import type { NasaSearchResult } from '@/lib/nasa';

type CollectionGalleryProps = {
  items: NasaSearchResult[];
};

export function CollectionGallery({ items }: CollectionGalleryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <NasaResultCard key={item.id} item={item} showSavePanel={false} />
      ))}
    </div>
  );
}
