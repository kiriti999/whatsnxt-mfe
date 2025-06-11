import React from 'react';
import { IconBrandLinkedin } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { CHECK_TOKEN_QUERY, GET_AUTH_URL_QUERY, SHARE_POST_MUTATION } from './linkedInQuery';

interface LinkedInShareProps {
    url: string;
    title?: string;
    thumbnailUrn?: string;
    description?: string;
    email?: string;
    media?: string[]; // ✅ Ensure media is defined in the props
}

const LinkedInShare: React.FC<LinkedInShareProps> = ({ url, title, thumbnailUrn, description, email, media }) => {
    const style = { cursor: 'pointer' };
    const router = useRouter();

    // Save data to localStorage
    localStorage.setItem('linkedinShareData', JSON.stringify({ url, title, thumbnailUrn, description, email }));

    // GraphQL hooks
    const { data: tokenData } = useQuery(CHECK_TOKEN_QUERY);
    const { data: authUrlData, refetch: fetchAuthUrl } = useQuery(GET_AUTH_URL_QUERY);
    const [sharePost] = useMutation(SHARE_POST_MUTATION);

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();

        // ✅ Ensure title is always defined
        if (!title) {
            console.error("Error: Title cannot be empty for LinkedIn sharing.");
            return;
        }

        // Check if LinkedIn token exists
        const tokenAvailable = tokenData?.checkLinkedInToken;
        console.log('handleShare :: tokenAvailable:', tokenAvailable)

        if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && !tokenAvailable) {
            try {
                await fetchAuthUrl();
                const authUrl = authUrlData?.getLinkedInAuthUrl?.authUrl;
                console.log('Redirecting to:', authUrl);

                if (authUrl) {
                    window.location.href = authUrl;
                } else {
                    throw new Error("No auth URL received.");
                }
            } catch (error) {
                console.error('Error fetching LinkedIn auth URL:', error);
            }
            return;
        }

        // If token is available, proceed to share the post
        if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            try {
                const descriptionWithLink = `${description} Learn more at: https://blog.whatsnxt.in`;
                const { data } = await sharePost({
                    variables: {
                        url,
                        title,
                        email,
                        text: descriptionWithLink,
                        thumbnailUrn,
                        media: media?.filter(Boolean) ?? [], // ✅ Ensure media is non-nullable
                    },
                });

                if (data?.shareLinkedInPost) {
                    notifications.show({
                        title: 'Success',
                        message: 'Post shared to the company page on LinkedIn!',
                        color: 'green',
                    });
                    router.push(url);
                }
            } catch (error: any) {
                notifications.show({
                    title: 'Error',
                    message: error.message || 'Failed to share the post on LinkedIn',
                    color: 'red',
                    autoClose: 3000,
                });
                router.push(url);
            } finally {
                localStorage.removeItem('linkedinShareData');
            }
        } else {
            // Default LinkedIn share functionality
            const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                url
            )}${title ? `&title=${encodeURIComponent(title)}` : ''}${description ? `&summary=${encodeURIComponent(description)}` : ''}`;
            window.open(shareUrl, '_blank');
        }
    };

    return (
        <Tooltip label="Share on LinkedIn" onClick={handleShare}>
            <IconBrandLinkedin size={20} style={style} />
        </Tooltip>
    );
};

export default LinkedInShare;
