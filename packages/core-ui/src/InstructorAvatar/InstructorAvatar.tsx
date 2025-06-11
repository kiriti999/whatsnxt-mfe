import React, { FC } from 'react';
import Image from 'next/image';

type InstructorAvatarProps = {
  profilePhoto: string;
}

export const InstructorAvatar: FC<InstructorAvatarProps> = ({ profilePhoto }) => {
  return (
    <div className="col-lg-4 col-md-4">
      <div className="advisor-image">
        <Image
          height={250}
          width={250}
          src={profilePhoto || 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp'}
          alt="trainer"
          className="img-thumbnail"
        />
      </div>
    </div>
  );
};
