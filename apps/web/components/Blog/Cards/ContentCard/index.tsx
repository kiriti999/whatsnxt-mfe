import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Divider, Tooltip, Box } from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { Card, Text, Badge, Group } from '@mantine/core';
import { IconCrown } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './ContentCard.module.css';

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
        subCategory?: string;
        nestedSubCategory?: string;
        firstPostSlug?: string; // Added from backend
        isPremium?: boolean;
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

    // Logic for displaying hierarchy: nestedSubCategory > subCategory > categoryName
    const displayCategory = content.nestedSubCategory || content.subCategory || content.categoryName || 'General';

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
                                <Box pos="relative" className={styles.imageContainer}>
                                    <Image
                                        priority
                                        src={imageSrc}
                                        alt={content.title}
                                        width={1200}
                                        height={630}
                                        sizes="(max-width: 480px) 350px, (max-width: 768px) 350px, 350px"
                                        className={styles.cardImage}
                                    />
                                    {content.isPremium && (
                                        <Badge
                                            pos="absolute"
                                            top={8}
                                            right={8}
                                            color="yellow"
                                            variant="filled"
                                            leftSection={<IconCrown size={12} />}
                                            size="sm"
                                        >
                                            Premium
                                        </Badge>
                                    )}
                                </Box>
                            </Card.Section>

                            <Card.Section>
                                <Divider my={0} />
                            </Card.Section>

                            <Group justify="space-between" mt="md" mb="sm">
                                <Badge color={categoryBadgeColor} variant={categoryBadgeVariant}>
                                    {displayCategory}
                                </Badge>
                            </Group>

                            <Text fw={600} size="md" mb="xs" lineClamp={2} h={22} className={styles.titleText}>
                                {content.title}
                            </Text>

                            <Text size="sm" className={styles.descriptionText} mb="md" lineClamp={4} h={77}>
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
