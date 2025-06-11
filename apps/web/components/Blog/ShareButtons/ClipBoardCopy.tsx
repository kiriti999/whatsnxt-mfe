import { useState } from 'react';
import { IconChecklist, IconClipboard } from '@tabler/icons-react';

const ClipboardCopy = ({ url }: any) => {
  const style = { color: 'green', cursor: 'pointer' }
  const [copied, setCopied] = useState<boolean>(false);
  const copyToClipboard = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div onClick={copyToClipboard}>
      {copied ? (
        <IconChecklist size={20} style={style} />
      ) : (
        <IconClipboard size={20} style={style} />
      )}
    </div>
  );
};

export default ClipboardCopy;
