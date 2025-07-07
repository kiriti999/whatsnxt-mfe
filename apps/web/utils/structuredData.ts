// utils/structuredData.ts
export interface Author {
    name: string;
    url?: string;
    image?: string;
}

export interface Organization {
    name: string;
    url: string;
    logo: string;
    sameAs?: string[];
}

export interface Article {
    headline: string;
    description: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    author: Author;
    url: string;
    wordCount?: number;
    readingTime?: string;
}

export interface Course {
    name: string;
    description: string;
    provider: Organization;
    instructor?: Author;
    image?: string;
    url: string;
    datePublished?: string;
    courseMode?: 'online' | 'offline' | 'hybrid';
    educationalLevel?: string;
    duration?: string;
    price?: number;
    currency?: string;
    rating?: {
        ratingValue: number;
        ratingCount: number;
    };
}

export interface Tutorial {
    name: string;
    description: string;
    image?: string;
    url: string;
    datePublished: string;
    dateModified?: string;
    author: Author;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    timeRequired?: string;
    supply?: string[];
    tool?: string[];
}

// Generate Article structured data
export const generateArticleSchema = (article: Article) => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.headline,
        "description": article.description,
        "image": [article.image],
        "datePublished": article.datePublished,
        "dateModified": article.dateModified || article.datePublished,
        "author": {
            "@type": "Person",
            "name": article.author.name,
            "url": article.author.url,
            "image": article.author.image
        },
        "publisher": {
            "@type": "Organization",
            "name": "whatsnxt",
            "url": "https://whatsnxt.in",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.whatsnxt.in/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": article.url
        },
        "wordCount": article.wordCount,
        "timeRequired": article.readingTime
    };
};

// Generate Course structured data
export const generateCourseSchema = (course: Course) => {
    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.name,
        "description": course.description,
        "provider": {
            "@type": "Organization",
            "name": course.provider.name,
            "url": course.provider.url,
            "logo": course.provider.logo,
            "sameAs": course.provider.sameAs
        },
        "url": course.url,
        "courseMode": course.courseMode || "online",
        "educationalLevel": course.educationalLevel
    };

    if (course.instructor) {
        schema.instructor = {
            "@type": "Person",
            "name": course.instructor.name,
            "url": course.instructor.url,
            "image": course.instructor.image
        };
    }

    if (course.image) {
        schema.image = course.image;
    }

    if (course.datePublished) {
        schema.datePublished = course.datePublished;
    }

    if (course.duration) {
        schema.timeRequired = course.duration;
    }

    if (course.price !== undefined) {
        schema.offers = {
            "@type": "Offer",
            "price": course.price,
            "priceCurrency": course.currency || "INR",
            "availability": "https://schema.org/InStock"
        };
    }

    if (course.rating) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": course.rating.ratingValue,
            "ratingCount": course.rating.ratingCount
        };
    }

    return schema;
};

// Generate Tutorial (HowTo) structured data
export const generateTutorialSchema = (tutorial: Tutorial) => {
    const schema: any = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": tutorial.name,
        "description": tutorial.description,
        "url": tutorial.url,
        "datePublished": tutorial.datePublished,
        "dateModified": tutorial.dateModified || tutorial.datePublished,
        "author": {
            "@type": "Person",
            "name": tutorial.author.name,
            "url": tutorial.author.url,
            "image": tutorial.author.image
        },
        "publisher": {
            "@type": "Organization",
            "name": "whatsnxt",
            "url": "https://whatsnxt.in",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.whatsnxt.in/logo.png"
            }
        }
    };

    if (tutorial.image) {
        schema.image = tutorial.image;
    }

    if (tutorial.timeRequired) {
        schema.totalTime = tutorial.timeRequired;
    }

    if (tutorial.difficulty) {
        schema.difficulty = tutorial.difficulty;
    }

    if (tutorial.supply && tutorial.supply.length > 0) {
        schema.supply = tutorial.supply.map(item => ({
            "@type": "HowToSupply",
            "name": item
        }));
    }

    if (tutorial.tool && tutorial.tool.length > 0) {
        schema.tool = tutorial.tool.map(item => ({
            "@type": "HowToTool",
            "name": item
        }));
    }

    return schema;
};

// Generate ItemList for carousels/collections
export const generateItemListSchema = (
    items: Array<{ name: string; url: string; image?: string; description?: string }>,
    listName: string,
    listDescription?: string
) => {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": listName,
        "description": listDescription,
        "numberOfItems": items.length,
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Thing",
                "name": item.name,
                "url": item.url,
                "image": item.image,
                "description": item.description
            }
        }))
    };
};

// Generate Organization schema for your company
export const generateOrganizationSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "whatsnxt",
        "alternateName": "whatsnxt Learning Platform",
        "url": "https://whatsnxt.in",
        "logo": "https://www.whatsnxt.in/logo.png",
        "description": "Online skill development & learning provider offering video courses and digital learning through articles and series on different categories.",
        "foundingDate": "2025", // Replace with actual founding date
        "sameAs": [
            // Add your social media URLs
            "https://facebook.com/whatsnxt",
            "https://twitter.com/whatsnxt",
            "https://linkedin.com/company/whatsnxt"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "areaServed": "IN",
            "availableLanguage": ["English", "Hindi"]
        },
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
        }
    };
};

// Generate WebSite schema with search action
export const generateWebSiteSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "whatsnxt",
        "alternateName": "whatsnxt Learning Platform",
        "url": "https://whatsnxt.in",
        "description": "Online skill development & learning provider offering video courses and digital learning through articles and series on different categories.",
        "publisher": {
            "@type": "Organization",
            "name": "whatsnxt",
            "url": "https://whatsnxt.in"
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.whatsnxt.in/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };
};