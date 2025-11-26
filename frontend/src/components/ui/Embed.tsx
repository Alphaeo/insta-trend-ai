import React, { useEffect, useRef, useState } from 'react';

interface EmbedProps {
  embedHtml: string;
  className?: string;
  fallback?: React.ReactNode;
  type?: 'instagram' | 'youtube' | 'tiktok' | 'generic';
}

const Embed: React.FC<EmbedProps> = ({ 
  embedHtml, 
  className = "", 
  fallback,
  type = 'generic'
}) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!embedHtml || hasError) {
      setIsLoading(false);
      return;
    }

    const ensureInstagramMarkup = (html: string): string => {
      // If provided HTML already has a blockquote, keep it.
      if (/instagram\.com/.test(html) && !/<blockquote/i.test(html)) {
        // If it's a raw URL, wrap it into Instagram blockquote format.
        const urlMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s"']+/i);
        const url = urlMatch ? urlMatch[0] : null;
        if (url) {
          return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>`;
        }
      }
      return html;
    };

    const processedHtml = type === 'instagram' ? ensureInstagramMarkup(embedHtml) : embedHtml;
    if (processedHtml !== embedHtml && embedRef.current) {
      embedRef.current.innerHTML = processedHtml;
    }

    const loadEmbedScript = () => {
      setIsLoading(true);
      
      switch (type) {
        case 'instagram': {
          const process = () => {
            if (window.instgrm?.Embeds?.process) {
              window.instgrm.Embeds.process();
              setIsLoaded(true);
            }
          };

          if (window.instgrm?.Embeds?.process) {
            process();
            // Re-process after a small delay to improve reliability
            setTimeout(process, 300);
            setIsLoading(false);
            return;
          }

          const script = document.createElement('script');
          script.async = true;
          script.src = '//www.instagram.com/embed.js';
          script.onload = () => {
            process();
            setTimeout(process, 300);
            setIsLoading(false);
          };
          script.onerror = () => {
            setHasError(true);
            setIsLoading(false);
          };
          document.head.appendChild(script);

          // Re-process on visibility to handle "Voir cette publication..." cases
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                process();
              }
            });
          });
          if (embedRef.current) observer.observe(embedRef.current);
          return () => observer.disconnect();
        }

        case 'youtube':
          setIsLoaded(true);
          setIsLoading(false);
          break;

        case 'tiktok':
          setIsLoaded(true);
          setIsLoading(false);
          break;

        default:
          setIsLoaded(true);
          setIsLoading(false);
          break;
      }
    };

    const cleanup = loadEmbedScript();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [embedHtml, hasError, type]);

  // Sanitize HTML to prevent XSS attacks
  const sanitizeHtml = (html: string): string => {
    // Basic sanitization - in production, use a proper library like DOMPurify
    const allowedTags = ['blockquote', 'script', 'iframe', 'div', 'span'];
    const allowedAttributes = ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'data-instgrm-permalink', 'data-instgrm-version'];
    
    // For now, we'll trust Instagram embeds as they come from Instagram
    // In production, implement proper sanitization
    return html;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`embed-loading ${className}`}>
        <div className="text-sm text-gray-500">Loading embed...</div>
      </div>
    );
  }

  // If there's an error or no embed HTML, show fallback
  if (hasError || !embedHtml) {
    return fallback ? <>{fallback}</> : (
      <div className={`embed-error ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>Embed unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={embedRef}
      className={`embed-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        minHeight: '300px'
      }}
    >
      <div
        dangerouslySetInnerHTML={{ 
          __html: sanitizeHtml(embedHtml) 
        }}
      />
    </div>
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

export default Embed;
