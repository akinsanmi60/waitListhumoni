import { useState, useEffect } from 'react';
import { getOptimizedSpacing } from '@/lib/ai-spacing';

export function useDynamicSpacing(contentType: 'hero' | 'features' | 'values', content: string) {
  const [spacing, setSpacing] = useState({
    padding: '1rem',
    gap: '1rem'
  });

  useEffect(() => {
    const updateSpacing = async () => {
      const screenWidth = window.innerWidth;
      const contentLength = content.length;

      try {
        const optimizedSpacing = await getOptimizedSpacing(
          screenWidth,
          contentType,
          contentLength
        );

        // Apply spacing based on screen width
        if (screenWidth < 768) {
          setSpacing({
            padding: optimizedSpacing.mobilePadding,
            gap: optimizedSpacing.gaps.mobile
          });
        } else if (screenWidth < 1024) {
          setSpacing({
            padding: optimizedSpacing.tabletPadding,
            gap: optimizedSpacing.gaps.tablet
          });
        } else {
          setSpacing({
            padding: optimizedSpacing.desktopPadding,
            gap: optimizedSpacing.gaps.desktop
          });
        }
      } catch (error) {
        console.error('Failed to optimize spacing:', error);
      }
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, [contentType, content]);

  return spacing;
}
