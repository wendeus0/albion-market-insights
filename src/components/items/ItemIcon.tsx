import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { buildCdnIconUrl, LOCAL_FALLBACK_ICON } from '@/components/items/itemIcon.utils';

interface ItemIconProps {
  itemId: string;
  itemName: string;
  className?: string;
}

export function ItemIcon({ itemId, itemName, className }: ItemIconProps) {
  const [useFallback, setUseFallback] = useState(false);
  const cdnIconUrl = useMemo(() => buildCdnIconUrl(itemId), [itemId]);

  useEffect(() => {
    setUseFallback(false);
  }, [itemId]);

  return (
    <img
      src={useFallback ? LOCAL_FALLBACK_ICON : cdnIconUrl}
      alt={`Icon for ${itemName}`}
      loading="lazy"
      width={32}
      height={32}
      className={cn(
        'h-8 w-8 rounded-md border border-border/50 bg-muted/40 object-cover shrink-0',
        className,
      )}
      onError={() => {
        if (!useFallback) {
          setUseFallback(true);
        }
      }}
    />
  );
}

