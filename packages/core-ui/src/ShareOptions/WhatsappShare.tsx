import React from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';

const WhatsappShare = ({ url }: any) => {
  const style = { cursor: 'pointer' }
  const handleShare = (e: any) => {
    e.preventDefault();
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };
  return (
    <div onClick={handleShare}>
      <Tooltip label='whatsapp'>
        <IconBrandWhatsapp size={20} style={style} />
      </Tooltip>
    </div>
  );
};

export default WhatsappShare;
