import React, { useState, useEffect } from 'react';
import { IconBrandLinkedin } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { LinkedInAPI } from '../../../../apps/web/apis/v1/blog/linkedInApi';

interface LinkedInShareProps {
    url: string;
    title?: string;
    thumbnailUrn?: string;
    description?: string;
    email?: string;
    media?: string[];
}

const LinkedInShare: React.FC<LinkedInShareProps> = ({ url, title, thumbnailUrn, description, email, media }: any) => {
    const style = { cursor: 'pointer' };
    const router = useRouter();
    const [tokenAvailable, setTokenAvailable] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Save data to localStorage
    useEffect(() => {
        localStorage.setItem('linkedinShareData', JSON.stringify({ url, title, thumbnailUrn, description, email }));
    }, [url, title, thumbnailUrn, description, email]);

    // Check token on component mount
    useEffect(() => {
        const checkTokenStatus = async () => {
            if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
                const tokenExists = await LinkedInAPI.checkToken();
                setTokenAvailable(tokenExists);
            }
        };

        checkTokenStatus();
    }, [email]);

    const truncateLinkedInText = (text: string, maxLength = 1900) => {
        if (!text) return '';

        // If text is within limit, return as is
        if (text.length <= maxLength) {
            return text;
        }

        // Truncate at 2996 characters and append "..."
        const truncateAt = maxLength - 3; // Reserve 3 characters for "..."
        return text.substring(0, truncateAt) + '...';
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();

        // Ensure title is always defined
        if (!title) {
            console.error("Error: Title cannot be empty for LinkedIn sharing.");
            notifications.show({
                title: 'Error',
                message: 'Title is required for LinkedIn sharing',
                color: 'red',
                autoClose: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            // Check if this is admin sharing
            if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
                // If no token available, redirect to LinkedIn auth
                if (!tokenAvailable) {
                    try {
                        const authUrl = await LinkedInAPI.getAuthUrl();
                        console.log('Redirecting to:', authUrl);

                        if (authUrl) {
                            window.location.href = authUrl;
                        } else {
                            throw new Error("No auth URL received.");
                        }
                    } catch (error) {
                        console.error('Error fetching LinkedIn auth URL:', error);
                        notifications.show({
                            title: 'Error',
                            message: 'Failed to get LinkedIn authorization URL',
                            color: 'red',
                            autoClose: 3000,
                        });
                    }
                    return;
                }

                // If token is available, proceed to share the post
                try {
                    const truncatedText = truncateLinkedInText(description);
                    const descriptionWithLink = `${truncatedText} Read more at: ${url}`;

                    const shareResult = await LinkedInAPI.sharePost({
                        url,
                        title,
                        email,
                        text: descriptionWithLink,
                        thumbnailUrn,
                        media: media?.filter(Boolean) ?? [],
                    });

                    if (shareResult) {
                        notifications.show({
                            title: 'Success',
                            message: 'Post shared to the company page on LinkedIn!',
                            color: 'green',
                        });
                        router.push(url);
                    }
                } catch (error: any) {
                    console.error('Error sharing post:', error);
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
                // Default LinkedIn share functionality for non-admin users
                const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                    url
                )}${title ? `&title=${encodeURIComponent(title)}` : ''}${description ? `&summary=${encodeURIComponent(description)}` : ''}`;
                window.open(shareUrl, '_blank');
            }
        } catch (error) {
            console.error('Unexpected error during LinkedIn share:', error);
            notifications.show({
                title: 'Error',
                message: 'An unexpected error occurred',
                color: 'red',
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Tooltip label={isLoading ? "Sharing..." : "Share on LinkedIn"}>
                <IconBrandLinkedin
                    size={20}
                    style={{
                        ...style,
                        opacity: isLoading ? 0.6 : 1,
                        pointerEvents: isLoading ? 'none' : 'auto'
                    }}
                    onClick={handleShare}
                />
            </Tooltip>
        </div>
    );
};

export default LinkedInShare;