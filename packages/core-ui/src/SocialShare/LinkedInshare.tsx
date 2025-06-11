import React from 'react';
import { IconBrandLinkedin } from '@tabler/icons-react';

interface LinkedInShareProps {
    url: string;
    title?: string;
    summary?: string;
    source?: string;
}

const LinkedInShare: React.FC<LinkedInShareProps> = ({ url, title, summary, source }) => {
    const style = { cursor: 'pointer' };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();

        // Construct the LinkedIn share URL
        const shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            url
        )}${title ? `&title=${encodeURIComponent(title)}` : ''}${summary ? `&summary=${encodeURIComponent(summary)}` : ''
            }${source ? `&source=${encodeURIComponent(source)}` : ''}`;

        window.open(shareUrl, '_blank');
    };

    return (
        <div onClick={handleShare}>
            <IconBrandLinkedin size={20} style={style} />
        </div>
    );
};

export default LinkedInShare;
