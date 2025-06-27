"use client"
import { Card, Image, Text, Skeleton } from '@mantine/core';
import classes from './index.module.css';
import { Group } from '@mantine/core';
import { useRouter } from 'next/navigation'

interface Props {
    imageUrl?: string;
    title?: string;
    updatedAt?: string;
    categoryName?: string;
    author?: string;
    slug?: string;
}

export const formatDate = (date: any) => {
    if (!date) return date;

    const d = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = d.getDate().toString().padStart(2, '0');
    return `${days[d.getDay()]} ${months[d.getMonth()]} ${day} ${d.getFullYear()}`;
};

export default function PopularPost(props: Props) {
    const { imageUrl, title, updatedAt, slug } = props;
    const router = useRouter();

    return (
        <Card withBorder mb={'xs'} radius="md" p={0} className={classes.card} onClick={() => { router.push(`${slug}`) }}>
            <Group wrap="nowrap" gap={5}>
                {title ?
                    <Image radius={'sm'} m={0} alt={title} src={imageUrl ?? ''} style={{ width: '40%' }} /> :
                    /* @ts-expect-error Server Component */
                    <Skeleton style={{ width: '40%', height: 100 }} square='true' />}
                {title ?
                    (<div className={classes.body}>
                        <Text className={classes.title} m={0} truncate="end" lineClamp={1}>
                            {title}
                        </Text>
                        <Text size="xs" c="dimmed" truncate="end">
                            {formatDate(updatedAt)}
                        </Text>
                    </div>) :
                    <div style={{ width: '55%' }}>
                        <Skeleton height={8} radius="xl" />
                        <Skeleton height={8} mt={6} radius="xl" />
                        <Skeleton height={8} mt={6} width="70%" radius="xl" />
                    </div>
                }
            </Group>
        </Card >
    );
}