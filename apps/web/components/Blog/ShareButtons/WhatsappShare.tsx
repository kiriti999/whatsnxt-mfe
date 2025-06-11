import {
  IconBrandWhatsapp,
} from '@tabler/icons-react';

const WhatsappShare = ({ url }: any) => {
  const style = { cursor: 'pointer' }
  const handleShare = (e: any) => {
    e.preventDefault();
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };
  return (
    <div onClick={handleShare}><IconBrandWhatsapp size={20} style={style} /></div>
  );
};

export default WhatsappShare;
