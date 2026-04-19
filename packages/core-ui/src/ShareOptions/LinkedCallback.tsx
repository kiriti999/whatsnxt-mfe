'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';
import { notifications } from '@mantine/notifications';
import { Container, Text } from '@mantine/core';
import { MantineLoader } from '@whatsnxt/core-ui';
import { LinkedInAPI } from '../../../../apps/web/apis/v1/blog/linkedInApi'; // Adjust path as needed

const LinkedInCallback = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [redirectUrl, setRedirectUrl] = useState('');

    useEffect(() => {
        const authCode = searchParams.get('code'); // Get the authorization code from URL
        if (authCode) {
            exchangeAuthCodeAndShare(authCode);
        }
    }, [searchParams]);

    const exchangeAuthCodeAndShare = async (authCode: string) => {
        try {
            // Retrieve data from localStorage
            const shareData = JSON.parse(localStorage.getItem('linkedinShareData') || '{}');
            const { url, title, thumbnailUrn, description, email, media } = shareData;

            setRedirectUrl(url);

            if (!url || !description || !title || !email) {
                console.error('Missing share data in localStorage.');
                throw new Error('Unable to retrieve data for sharing. Please try again.');
            }

            // 🔹 Step 1: Exchange authorization code for tokens
            const callbackResult = await LinkedInAPI.handleCallback(authCode);
            console.log('LinkedIn authorization successful. Token saved:', callbackResult);

            // 🔹 Step 2: Share the post after token exchange
            // description is already stripped of HTML (cleaned in LinkedInShare before storing)
            const truncatedDescription = description && description.length > 1900
                ? description.substring(0, 1897) + '...'
                : description;

            const shareResult = await LinkedInAPI.sharePost({
                url,
                title,
                email,
                text: truncatedDescription,
                thumbnailUrn,
                media: media?.filter(Boolean) ?? [], // Ensure media is non-nullable
            });

            if (shareResult) {
                console.log('Post shared successfully:', shareResult);

                // Notify success
                notifications.show({
                    title: 'Success',
                    message: 'Post shared to the company page on LinkedIn!',
                    color: 'green',
                });

                // Clear localStorage after sharing the post
                localStorage.removeItem('linkedinShareData');

                router.push(url);
            } else {
                throw new Error('Failed to share post - no response data');
            }

        } catch (error: any) {
            console.error('Failed to share post after authorization:', error);
            notifications.show({
                title: 'Error',
                message: error.message || 'Failed to share the post on LinkedIn',
                color: 'red',
                autoClose: 3000,
            });

            // Redirect to the original URL or a fallback
            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/'); // Fallback to home page
            }
        }
    };

    return (
        <Container
            style={{
                width: '90%',
                maxWidth: '50rem',
                height: '60vh',
                maxHeight: '30rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                margin: '0 auto',
                padding: '1rem',
            }}
        >
            <Text mt="md" size="lg" fw={500}>
                Processing LinkedIn authorization and sharing post...
            </Text>
            <MantineLoader size="lg" />
        </Container>
    );
};

export default LinkedInCallback;