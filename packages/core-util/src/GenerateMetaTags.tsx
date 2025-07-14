// utils/metadataUtils.ts
import type { Metadata } from 'next';

// Define the OpenGraph type based on Next.js metadata types
type OpenGraphType = 'website' | 'article' | 'book' | 'profile' |
    'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' |
    'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

interface MetadataParams {
    title?: string;
    description?: string;
    image?: {
        url: string;
        width?: number;
        height?: number;
        alt?: string;
        type?: string; // ✅ Added for LinkedIn
    } | string;
    canonical?: string;
    keywords?: string[];
    author?: string;
    publishedDate?: string;
    modifiedDate?: string;
    type?: OpenGraphType;
    siteName?: string;
    tags?: string[]; // ✅ Added for LinkedIn article tags
    section?: string; // ✅ Added for LinkedIn article section
}

export function generateMetadata({
    title = 'whatsnxt.in',
    description = 'Courses on any category',
    image,
    canonical,
    keywords = [],
    author,
    publishedDate,
    modifiedDate,
    type = 'website',
    siteName = 'whatsnxt.in',
    tags = [], // ✅ LinkedIn article tags
    section // ✅ LinkedIn article section
}: MetadataParams): Metadata {

    // ✅ Enhanced image normalization with LinkedIn optimization
    const normalizedImage = typeof image === 'string'
        ? {
            url: optimizeImageForLinkedIn(image),
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/png' // Default type
        }
        : image ? {
            ...image,
            url: optimizeImageForLinkedIn(image.url),
            width: image.width || 1200,
            height: image.height || 630,
            alt: image.alt || title,
            type: image.type || 'image/png'
        } : undefined;

    // Create base metadata
    const metadata: Metadata = {
        title,
        description,
        keywords: keywords.length > 0 ? keywords : undefined,
        authors: author ? [{ name: author }] : undefined,
        metadataBase: new URL('https://www.whatsnxt.in'),
        // ✅ Enhanced robots for LinkedIn crawling
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        // ✅ Add publisher information
        publisher: 'whatsnxt.in',
    };

    // Build openGraph object with LinkedIn optimizations
    const openGraph: any = {
        title,
        description,
        url: canonical,
        siteName,
        locale: 'en_US',
        type,
    };

    // ✅ Enhanced article metadata for LinkedIn
    if (type === 'article') {
        if (publishedDate) {
            openGraph.publishedTime = formatDateForLinkedIn(publishedDate);
        }
        if (modifiedDate) {
            openGraph.modifiedTime = formatDateForLinkedIn(modifiedDate);
        }

        // ✅ LinkedIn article-specific fields
        if (author) {
            openGraph.authors = [`https://www.whatsnxt.in/author/${author.toLowerCase().replace(/\s+/g, '-')}`];
        }
        if (section) {
            openGraph.section = section;
        }
        if (tags.length > 0) {
            openGraph.tags = tags;
        }
    }

    // ✅ Enhanced image handling for LinkedIn
    if (normalizedImage?.url) {
        openGraph.images = [{
            url: normalizedImage.url,
            width: normalizedImage.width,
            height: normalizedImage.height,
            alt: normalizedImage.alt,
            type: normalizedImage.type,
        }];

        // ✅ Enhanced Twitter card for better fallback
        metadata.twitter = {
            card: 'summary_large_image',
            title,
            description,
            images: [normalizedImage.url],
            creator: '@whatsnxt_in',
            site: '@whatsnxt_in',
        };
    } else {
        metadata.twitter = {
            card: 'summary',
            title,
            description,
            creator: '@whatsnxt_in',
            site: '@whatsnxt_in',
        };
    }

    // Assign the openGraph to metadata
    metadata.openGraph = openGraph;

    // Add canonical URL
    if (canonical) {
        metadata.alternates = { canonical };
    }

    // ✅ Add additional metadata for LinkedIn
    metadata.other = {
        // LinkedIn company page reference
        'linkedin:owner': '105606569', // Your LinkedIn Organization ID
        // Additional LinkedIn-friendly tags
        'article:publisher': 'https://www.linkedin.com/company/105606569',
        ...(author && { 'profile:username': author.toLowerCase().replace(/\s+/g, '_') }),
    };

    return metadata;
}

// ✅ Function to optimize images for LinkedIn using Cloudinary
function optimizeImageForLinkedIn(imageUrl: string): string {
    // Check if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
        // Extract the base URL and add LinkedIn-optimized transformations
        const cloudinaryOptimizations = 'w_1200,h_630,c_fill,f_auto,q_auto,dpr_1.0';

        // Insert transformations into Cloudinary URL
        return imageUrl.replace(
            /\/upload\//,
            `/upload/${cloudinaryOptimizations}/`
        );
    }

    // For non-Cloudinary images, return as-is
    return imageUrl;
}

// ✅ Enhanced fallback metadata with LinkedIn-optimized images
export const fallbackMetadata = {
    general: {
        title: "whatsnxt.in",
        description: "Blog on any category - Learn programming, development, and technology etc",
        image: "https://www.whatsnxt.in/og-default.jpg",
        section: "Technology"
    },
    article: {
        title: "Article | whatsnxt.in",
        description: "Read our latest articles and insights on programming and technology etc",
        image: "https://www.whatsnxt.in/og-article.jpg",
        section: "Articles"
    },
    course: {
        title: "Course | whatsnxt.in",
        description: "Explore our comprehensive courses and learning materials",
        image: "https://www.whatsnxt.in/og-course.jpg",
        section: "Education"
    },
    interview: {
        title: "Interview Question | whatsnxt.in",
        description: "Expert answers to technical interview questions and preparation",
        image: "https://www.whatsnxt.in/og-interview.jpg",
        section: "Career"
    }
};

// Helper function to get appropriate fallback
export function getFallbackMetadata(contentType: keyof typeof fallbackMetadata) {
    return fallbackMetadata[contentType] || fallbackMetadata.general;
}

// ✅ Enhanced excerpt function with better LinkedIn compatibility
export function createExcerpt(htmlContent: string, maxLength: number = 155): string {
    if (!htmlContent) return '';

    // Strip HTML tags more thoroughly
    const textOnly = htmlContent
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove styles
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp;
        .replace(/&[a-z]+;/gi, ' '); // Replace other HTML entities

    // Clean up whitespace
    const cleaned = textOnly.replace(/\s+/g, ' ').trim();

    // Truncate to appropriate length for LinkedIn (they prefer 150-160 chars)
    if (cleaned.length <= maxLength) return cleaned;

    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return lastSpace > 0
        ? truncated.substring(0, lastSpace) + '...'
        : truncated + '...';
}

// ✅ Helper function to extract tags from content
export function extractTagsFromKeywords(keywords: string[], maxTags: number = 5): string[] {
    return keywords
        .filter(tag => tag && tag.trim().length > 0)
        .map(tag => tag.trim())
        .slice(0, maxTags);
}

// ✅ Helper function to format dates for LinkedIn
export function formatDateForLinkedIn(dateString: string): string {
    try {
        return new Date(dateString).toISOString();
    } catch {
        return new Date().toISOString();
    }
}

// ✅ LinkedIn-specific validation function
export function validateLinkedInMetadata(metadata: MetadataParams): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
} {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check title length (LinkedIn prefers 60-70 characters)
    if (metadata.title && metadata.title.length > 70) {
        warnings.push('Title is longer than 70 characters, may be truncated on LinkedIn');
    }

    // Check description length (LinkedIn prefers 150-160 characters)
    if (metadata.description && metadata.description.length > 160) {
        warnings.push('Description is longer than 160 characters, may be truncated on LinkedIn');
    }

    // Check image requirements
    if (metadata.image) {
        const img = typeof metadata.image === 'string' ? { url: metadata.image } : metadata.image;
        if (img.width && img.height) {
            const ratio = img.width / img.height;
            if (Math.abs(ratio - 1.91) > 0.1) {
                suggestions.push('Image ratio should be 1.91:1 (1200x630) for optimal LinkedIn display');
            }
        }
    }

    return {
        isValid: warnings.length === 0,
        warnings,
        suggestions
    };
}