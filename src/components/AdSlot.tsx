import { useEffect, useRef } from 'react';

type AdFormat = 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

interface AdSlotProps {
  /** AdSense ad slot ID (numeric string from your AdSense dashboard). */
  slot: string;
  /** Ad format. Defaults to 'auto' (responsive). */
  format?: AdFormat;
  /** Layout key for in-article / in-feed units. */
  layout?: string;
  layoutKey?: string;
  /** Whether the unit should fill its container width. Defaults to true. */
  fullWidthResponsive?: boolean;
  className?: string;
  /** Optional label shown above the ad (e.g. "Advertisement"). */
  label?: string;
  /** Min height reserve to reduce CLS. */
  minHeight?: number;
}

const PUBLISHER_ID = 'ca-pub-2652698972769734';

/**
 * Responsive Google AdSense ad unit.
 * The AdSense loader script is injected globally in index.html.
 */
export function AdSlot({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  fullWidthResponsive = true,
  className,
  label = 'Advertisement',
  minHeight = 100,
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      // @ts-ignore - adsbygoogle is injected by the global loader script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (e) {
      // Silently ignore — common in dev / when ad blocker is active.
      console.warn('AdSense push skipped:', e);
    }
  }, []);

  return (
    <div className={`w-full my-4 ${className ?? ''}`}>
      {label && (
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center mb-1">
          {label}
        </p>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: 'block', minHeight, width: '100%' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
