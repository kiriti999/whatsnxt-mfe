import React from 'react';
import { IconBrandFacebook } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';

const FacebookShare = ({ url }: any) => {
  const style = { cursor: 'pointer' }
  const handleShare = (e: any) => {
    e.preventDefault();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
    );
  };
  return (
    <div onClick={handleShare}>
      <Tooltip label='facebook'>
        <IconBrandFacebook size={20} style={style} />
      </Tooltip>
    </div>
  );
};

export default FacebookShare;
