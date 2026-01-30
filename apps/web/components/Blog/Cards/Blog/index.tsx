import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Divider, LoadingOverlay, Tooltip } from '@mantine/core';
import {
  Card,
  Text,
  Badge,
  Group,
} from '@mantine/core';

function BlogCard({blog}: any) {
  console.log('🚀 :: BlogCard :: blog:', blog)
  const [loading, setLoading] = useState(false);

  const handleNavigation = () => {
    setLoading(true);
  };

  const limitWords = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <>
      {/* Overlay Loader */}
      {loading && (
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
      )}

      {/* Blog Card */}
      {blog && (
        <Tooltip label={blog.title} position="bottom">
          <Anchor component={Link} href={`/content/${blog.slug}`}>
            <Card px={'xs'} py={0} radius="md" withBorder onClick={handleNavigation}>
              <Card.Section>
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  width={300}
                  height={200}
                  sizes="(max-width: 480px) 300px, (max-width: 768px) 280px, 300px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Card.Section>
              <Card.Section>
                <Divider my={0} />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="sm">
                <Badge color="pink">{blog.categoryName}</Badge>
              </Group>
              <Text size="sm" mb="sm" lineClamp={2}>
                {limitWords(blog.title, 5)}
              </Text>
            </Card>
          </Anchor>
        </Tooltip>
      )}
    </>
  )
}

interface IBlogCard {
  title: string;
  slug: string;
  categoryName: string;
  imageUrl: string;
  listed: boolean;
}

export default BlogCard;