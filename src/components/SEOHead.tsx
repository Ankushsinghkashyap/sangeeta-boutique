import React, { useEffect } from 'react';
import { Design, WebsiteContent } from '../types/index.ts';

interface SEOHeadProps {
  currentView: 'home' | 'designs' | 'about' | 'contact' | 'track' | 'admin-login' | 'admin-dashboard';
  selectedDesign?: Design | null;
  activeCategory?: string;
  content?: WebsiteContent;
}

/**
 * Dynamically injects SEO meta tags, OpenGraph social sharing metadata,
 * Twitter cards, canonical URLs, and Schema.org JSON-LD structured data.
 *
 * Specifically optimized for top search ranking on queries such as:
 * "sangeeta boutique", "sangita boutique", "sangeeta boutique nepal",
 * "sangita boutique kapilvastu", and "sangeeta boutique dumara chowk".
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  currentView,
  selectedDesign,
  activeCategory,
  content = {},
}) => {
  useEffect(() => {
    const origin = window.location.origin;
    const phone = content.phone_number || '+9779702742100';
    const email = content.email_address || 'ankushsinghkashyap34@gmail.com';
    const address = content.physical_address || 'Dumara chowk kapilvastu nepal';
    const defaultImage = `${origin}/images/hero-model.jpg`;

    // 1. Determine Title, Description, Canonical URL, Image, and Type
    let title = 'Sangeeta Boutique (Sangita Boutique) — Bespoke Tailoring & Bridal Couture';
    let description =
      'Sangeeta Boutique (also known as Sangita Boutique) at Dumara Chowk, Kapilvastu, Nepal. Handcrafted bridal blouses, festive lehengas, designer suits, and custom stitching with master fit by Sangeeta Kashyap.';
    let canonical = origin;
    let ogImage = defaultImage;
    let ogType = 'website';
    let keywords =
      'sangeeta boutique, sangita boutique, sangeeta boutique kapilvastu, sangita boutique nepal, sangeeta boutique dumara chowk, sangeeta tailor, sangita tailor, bridal blouse stitching, custom lehengas, sangita fashion, sangeeta kashyap';

    if (selectedDesign) {
      // Design Detail SEO
      title = `${selectedDesign.name} (${selectedDesign.designCode}) — Sangeeta Boutique (Sangita Boutique)`;
      description = `Order ${selectedDesign.name} (${selectedDesign.designCode}) in ${selectedDesign.categoryName}. Custom tailored starting at ₹${selectedDesign.totalPrice} with express fitting at Sangeeta Boutique (Sangita Boutique), Dumara Chowk, Kapilvastu.`;
      canonical = `${origin}/?design=${encodeURIComponent(selectedDesign.designCode)}`;
      ogImage = selectedDesign.mainImage.startsWith('http')
        ? selectedDesign.mainImage
        : `${origin}${selectedDesign.mainImage}`;
      ogType = 'product';
      keywords = `${selectedDesign.name}, ${selectedDesign.designCode}, ${selectedDesign.categoryName}, sangeeta boutique, sangita boutique, bespoke sewing, bridal tailor kapilvastu`;
    } else if (currentView === 'designs') {
      const catText = activeCategory && activeCategory !== 'all' ? ` ${activeCategory} Collection` : '';
      title = `Designer Catalog${catText} — Sangeeta Boutique (Sangita Boutique)`;
      description = `Browse the bespoke${catText.toLowerCase()} lookbook from Sangeeta Boutique (Sangita Boutique). Handcrafted designer blouses, royal wedding lehengas, festive anarkalis, and Indo-western silhouettes.`;
      canonical = activeCategory && activeCategory !== 'all'
        ? `${origin}/?view=designs&category=${encodeURIComponent(activeCategory)}`
        : `${origin}/?view=designs`;
      ogImage = `${origin}/images/bridal-blouse-red.jpg`;
      keywords = `sangeeta boutique designs, sangita boutique catalog, bridal blouses, royal lehengas, anarkali suits, custom tailoring nepal`;
    } else if (currentView === 'about') {
      title = 'About Sangeeta Boutique (Sangita Boutique) — Heritage & Master Couturier Sangeeta Kashyap';
      description = `Discover the story of Sangeeta Boutique (Sangita Boutique). Over a decade of couture mastery, 15,000+ satisfied clients, and heritage craftsmanship in Dumara Chowk, Kapilvastu, Nepal.`;
      canonical = `${origin}/?view=about`;
      ogImage = `${origin}/images/hero-model.jpg`;
      keywords = `about sangeeta boutique, about sangita boutique, sangeeta kashyap, tailor in kapilvastu, master couturier nepal`;
    } else if (currentView === 'contact') {
      title = 'Contact Sangeeta Boutique (Sangita Boutique) — Studio Location & Bookings';
      description = `Visit Sangeeta Boutique (Sangita Boutique) at Dumara Chowk, Kapilvastu, Nepal. Call +9779702742100 or book custom sewing consultations and bridal fittings online.`;
      canonical = `${origin}/?view=contact`;
      ogImage = `${origin}/images/hero-model.jpg`;
      keywords = `contact sangeeta boutique, sangita boutique phone number, sangeeta boutique address dumara chowk kapilvastu nepal, whatsapp sangita boutique`;
    } else if (currentView === 'track') {
      title = 'Track Order Milestones — Sangeeta Boutique (Sangita Boutique)';
      description = `Track your custom sewing progress in real time with Sangeeta Boutique (Sangita Boutique). Enter your Order ID and phone number for live tailoring updates.`;
      canonical = `${origin}/?view=track`;
    } else if (currentView === 'admin-login' || currentView === 'admin-dashboard') {
      title = 'Studio Management Portal — Sangeeta Boutique';
      description = 'Secure administrator management console for Sangeeta Boutique.';
      canonical = `${origin}/?view=admin`;
    }

    // 2. Update Document Title
    document.title = title;

    // Helper: update or insert a <meta> tag
    const setMetaTag = (attribute: string, attrValue: string, contentVal: string) => {
      let element = document.head.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper: update or insert a <link> tag
    const setLinkTag = (rel: string, hrefVal: string) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefVal);
    };

    // Helper: update or insert JSON-LD script
    const setJsonLdScript = (id: string, data: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data, null, 2);
    };

    // 3. Inject Primary SEO Metas
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', 'Sangeeta Kashyap — Sangeeta Boutique');
    setMetaTag('name', 'application-name', 'Sangeeta Boutique');

    // Admin pages should not be indexed by search bots
    if (currentView === 'admin-login' || currentView === 'admin-dashboard') {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 4. Inject Canonical URL
    setLinkTag('canonical', canonical);

    // 5. Inject OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Discord)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:alt', title);
    setMetaTag('property', 'og:site_name', 'Sangeeta Boutique (Sangita Boutique)');
    setMetaTag('property', 'og:locale', 'en_US');

    // 6. Inject Twitter / X Social Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:image:alt', title);

    // 7. Inject Schema.org LocalBusiness & ClothingStore Structured Data (JSON-LD)
    // This allows Google to index "Sangeeta Boutique" and "Sangita Boutique" as top local results
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      '@id': `${origin}/#boutique`,
      name: 'Sangeeta Boutique',
      alternateName: [
        'Sangita Boutique',
        'Sangeeta Tailoring & Designer Studio',
        'Sangita Tailors',
        'Sangeeta Boutique Kapilvastu',
      ],
      url: origin,
      logo: `${origin}/images/hero-model.jpg`,
      image: [
        `${origin}/images/hero-model.jpg`,
        `${origin}/images/bridal-blouse-red.jpg`,
        `${origin}/images/lehenga-royal.jpg`,
      ],
      description:
        'Sangeeta Boutique (Sangita Boutique) is a premium couture atelier and custom tailoring boutique founded by Sangeeta Kashyap in Dumara Chowk, Kapilvastu, Nepal. Specializing in bespoke bridal blouses, royal suits, festive lehengas, and express alterations.',
      telephone: phone,
      email: email,
      priceRange: '₹₹',
      currenciesAccepted: 'NPR, INR',
      paymentAccepted: 'Cash, Bank Transfer, Digital Wallets',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Dumara chowk',
        addressLocality: 'Kapilvastu',
        addressRegion: 'Lumbini Province',
        addressCountry: 'NP',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '27.5500',
        longitude: '83.0500',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:30',
          closes: '20:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '11:00',
          closes: '18:00',
        },
      ],
      founder: {
        '@type': 'Person',
        name: 'Sangeeta Kashyap',
        jobTitle: 'Head Couturier & Master Tailor',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Boutique Custom Tailoring & Designer Silhouettes',
        itemListElement: [
          {
            '@type': 'OfferCatalog',
            name: 'Bridal Blouses',
          },
          {
            '@type': 'OfferCatalog',
            name: 'Royal Suits & Anarkalis',
          },
          {
            '@type': 'OfferCatalog',
            name: 'Festive Lehengas',
          },
          {
            '@type': 'OfferCatalog',
            name: 'Custom Fitting & Alterations',
          },
        ],
      },
    };

    setJsonLdScript('seo-jsonld-localbusiness', localBusinessSchema);

    // 8. Inject WebSite Search Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: 'Sangeeta Boutique (Sangita Boutique)',
      alternateName: 'Sangita Boutique',
      description: 'Online catalog and custom sewing order tracking for Sangeeta Boutique in Nepal.',
      inLanguage: 'en',
    };

    setJsonLdScript('seo-jsonld-website', websiteSchema);

    // 9. If a specific design is active, inject Product Schema.org JSON-LD
    const productScriptId = 'seo-jsonld-product';
    if (selectedDesign) {
      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: selectedDesign.name,
        image: selectedDesign.mainImage.startsWith('http')
          ? selectedDesign.mainImage
          : `${origin}${selectedDesign.mainImage}`,
        description: selectedDesign.description,
        sku: selectedDesign.designCode,
        mpn: selectedDesign.designCode,
        category: selectedDesign.categoryName,
        brand: {
          '@type': 'Brand',
          name: 'Sangeeta Boutique',
          alternateName: 'Sangita Boutique',
        },
        offers: {
          '@type': 'Offer',
          url: canonical,
          priceCurrency: 'INR',
          price: selectedDesign.totalPrice,
          priceValidUntil: '2027-12-31',
          availability:
            selectedDesign.status === 'unavailable'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'ClothingStore',
            name: 'Sangeeta Boutique',
          },
        },
      };
      setJsonLdScript(productScriptId, productSchema);
    } else {
      // Clean up product schema if not viewing a product
      const existingProductScript = document.getElementById(productScriptId);
      if (existingProductScript) {
        existingProductScript.remove();
      }
    }
  }, [currentView, selectedDesign, activeCategory, content]);

  return null;
};
