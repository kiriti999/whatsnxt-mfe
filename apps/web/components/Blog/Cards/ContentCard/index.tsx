import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Divider, Tooltip, Box } from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { Card, Text, Badge, Group } from '@mantine/core';
import { useState } from 'react';

interface ContentCardProps {
    content: {
        _id?: string;
        id?: string;
        slug: string;
        title: string;
        description?: string;
        imageUrl?: string;
        categoryName?: string;
        tutorial?: boolean;
        isStructured?: boolean;
        firstPostSlug?: string; // Added from backend
        [key: string]: any;
    };
}

/**
 * Decode HTML entities to readable text
 * Converts entities like &#039; to ' and &amp; to &
 */
function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Strip HTML tags and decode entities to get clean plain text
 */
function getPlainText(html: string): string {
    // First strip HTML tags
    const withoutTags = html.replace(/<[^>]+>/g, '');
    // Then decode HTML entities
    return decodeHtmlEntities(withoutTags);
}

function ContentCard({ content }: ContentCardProps) {
    const [loading, setLoading] = useState(false);

    const handleNavigation = () => {
        setLoading(true);
    };

    // Construct href based on content type
    // If structured tutorial and has firstPostSlug, link to first post
    let href = `/content/${content.slug}`;
    if (content.isStructured && content.firstPostSlug) {
        href = `/content/${content.slug}/${content.firstPostSlug}`;
    }

    // Determine badge color based on content type
    const categoryBadgeColor = content.isStructured ? 'blue' : 'pink';
    const categoryBadgeVariant = content.isStructured ? 'light' : undefined;

    // Fallback image for structured tutorials
    const imageSrc = content.imageUrl ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

    return (
        <>
            <FullPageOverlay visible={loading} />

            {content && (
                <Tooltip label={content.title} position="bottom">
                    <Anchor component={Link} href={href} underline="never">
                        <Card
                            px={'xs'}
                            py={0}
                            radius="md"
                            withBorder
                            onClick={handleNavigation}
                            w={350}
                        >
                            <Card.Section>
                                <Box pos="relative">
                                    <Image
                                        priority
                                        src={imageSrc}
                                        alt={content.title}
                                        width={300}
                                        height={200}
                                        sizes="(max-width: 480px) 300px, (max-width: 768px) 280px, 300px"
                                        style={{
                                            width: '100%',
                                            height: '245px',
                                            display: 'block',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
                            </Card.Section>

                            <Card.Section>
                                <Divider my={0} />
                            </Card.Section>

                            <Group justify="space-between" mt="md" mb="sm">
                                <Badge color={categoryBadgeColor} variant={categoryBadgeVariant}>
                                    {content.categoryName || 'General'}
                                </Badge>
                            </Group>

                            <Text fw={600} size="md" mb="xs" lineClamp={2} h={22}>
                                {content.title}
                            </Text>

                            <Text size="sm" c="dimmed" mb="md" lineClamp={4} h={77}>
                                {content.description ? getPlainText(content.description) : 'No description available'}
                            </Text>
                        </Card>
                    </Anchor>
                </Tooltip>
            )}
        </>
    );
}

export default ContentCard;
