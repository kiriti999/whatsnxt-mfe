import React, { FC } from 'react';
import Image from 'next/image';

type CircleAvatarProps = {
    profilePhoto?: string;
    width?: number;
    height?: number;
}

export const CircleAvatar: FC<CircleAvatarProps> = ({ profilePhoto, width = 128, height = 128 }) => {
    return (
        <div className="col-lg-2 col-md-2">
            <div className="advisor-image">
                <Image
                    width={width}
                    height={height}
                    src={profilePhoto || 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp'}
                    alt="trainer"
                    className="img-thumbnail"
                    style={{ borderRadius: '50%' }}
                />
            </div>
        </div>
    );
};
