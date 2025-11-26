import React, { useEffect, useRef, useState } from 'react';

interface EmbedProps {
  embedHtml: string;
  className?: string;
  fallback?: React.ReactNode;
}

const InstagramEmbed: React.FC<EmbedProps> = ({ embedHtml, className = "", fallback }) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!embedHtml || hasError) return;

    // Load Instagram embed script if not already loaded
    const loadInstagramScript = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = '//www.instagram.com/embed.js';
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
          setIsLoaded(true);
        }
      };
      script.onerror = () => {
        setHasError(true);
      };
      document.head.appendChild(script);
    };

    // Clean up function
    const cleanup = () => {
      const scripts = document.querySelectorAll('script[src="//www.instagram.com/embed.js"]');
      scripts.forEach(script => script.remove());
    };

    loadInstagramScript();

    return cleanup;
  }, [embedHtml, hasError]);

  // If there's an error or no embed HTML, show fallback
  if (hasError || !embedHtml) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div 
      ref={embedRef}
      className={`instagram-embed ${className}`}
      dangerouslySetInnerHTML={{ __html: embedHtml }}
    />
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default InstagramEmbed;

