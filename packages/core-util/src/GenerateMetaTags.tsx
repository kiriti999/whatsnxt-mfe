// utils/metadataUtils.ts
import type { Metadata } from 'next';
import Head from 'next/head';

// Define the OpenGraph type based on Next.js metadata types
type OpenGraphType = 'website' | 'article' | 'book' | 'profile' |
    'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' |
    'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

interface MetadataParams {
    title?: any;
    description?: string;
    image?: {
        url: string;
        width?: number;
        height?: number;
        alt?: string;
    };
    canonical?: string;
    keywords?: string[];
    author?: string;
    publishedDate?: string;
    modifiedDate?: string;
    type?: OpenGraphType;
    siteName?: string;
}

export function generateMetadata({
    title,
    description,
    image,
    canonical,
    keywords,
    author,
    publishedDate,
    modifiedDate,
    type = 'website',
    siteName = 'whatsnxt.in'
}: MetadataParams): any {
    // Create base metadata
    const metadata: Metadata = {
        title,
        description,
        keywords,
        authors: author ? [{ name: author }] : undefined,
        metadataBase: new URL('https://whatsnxt.in'),
    };

    // Build openGraph object
    const openGraph: any = {
        title,
        description,
        url: canonical,
        siteName,
        locale: 'en_US',
        type,
    };

    // Add publication dates for articles
    if (type === 'article' && publishedDate) {
        openGraph.publishedTime = publishedDate;

        if (modifiedDate) {
            openGraph.modifiedTime = modifiedDate;
        }
    }

    // Add image if provided
    if (image) {
        openGraph.images = [{
            url: image.url,
            width: image.width || 1200,
            height: image.height || 630,
            alt: image.alt || title,
        }];

        // Add Twitter card
        metadata.twitter = {
            card: 'summary_large_image',
            title,
            description,
            images: image.url,
        };
    } else {
        // Default Twitter card without image
        metadata.twitter = {
            card: 'summary',
            title,
            description
        };
    }

    // Assign the openGraph to metadata
    metadata.openGraph = openGraph;

    // Add canonical URL
    if (canonical) {
        metadata.alternates = { canonical };
    }

    return metadata;
}

// Create useful fallbacks for common content types
export const fallbackMetadata = {
    general: {
        title: "whatsnxt.in",
        description: "Courses on any category",
    },
    article: {
        title: "Article | whatsnxt.in",
        description: "Read our latest articles and insights",
    },
    course: {
        title: "Course | whatsnxt.in",
        description: "Explore our courses and learning materials",
    },
    interview: {
        title: "Interview Question | whatsnxt.in",
        description: "Expert answers to technical interview questions",
    }
};

export const ClientSideMetaTags: React.FC<MetadataParams> = ({
    title,
    description,
    image,
    canonical,
    keywords,
    author,
    publishedDate,
    modifiedDate,
    type = 'website',
    siteName = 'whatsnxt.in'
}) => {
    return (
        <Head>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}

            {/* Basic OG Tags */}
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Keywords */}
            {keywords && keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}

            {/* Author */}
            {author && <meta name="author" content={author} />}

            {/* Dates for articles */}
            {type === 'article' && publishedDate && (
                <meta property="article:published_time" content={publishedDate} />
            )}
            {type === 'article' && modifiedDate && (
                <meta property="article:modified_time" content={modifiedDate} />
            )}

            {/* Image-related tags */}
            {image && (
                <>
                    <meta property="og:image" content={image.url} />
                    {image.width && <meta property="og:image:width" content={String(image.width)} />}
                    {image.height && <meta property="og:image:height" content={String(image.height)} />}
                    {image.alt && <meta property="og:image:alt" content={image.alt} />}

                    {/* Twitter tags */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={title} />
                    {description && <meta name="twitter:description" content={description} />}
                    <meta name="twitter:image" content={image.url} />
                    {image.alt && <meta name="twitter:image:alt" content={image.alt} />}
                </>
            )}

            {/* Default Twitter card if no image */}
            {!image && (
                <>
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:title" content={title} />
                    {description && <meta name="twitter:description" content={description} />}
                </>
            )}
        </Head>
    );
};