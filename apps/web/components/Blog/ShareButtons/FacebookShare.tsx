import {
  IconBrandFacebook,
} from '@tabler/icons-react';

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
    <div onClick={handleShare}><IconBrandFacebook size={20} style={style} /></div>
  );
};

export default FacebookShare;
