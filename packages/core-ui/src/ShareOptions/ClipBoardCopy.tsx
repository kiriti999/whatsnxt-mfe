import React from 'react';
import { useState } from 'react';
import { IconClipboard } from '@tabler/icons-react';
import { IconClipboardCheck } from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';

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
        <Tooltip label='copied'>
          <IconClipboardCheck size={20} style={style} />
        </Tooltip>
      ) : (
        <Tooltip label='click to copy'>
          <IconClipboard size={20} style={style} />
        </Tooltip>
      )}
    </div>
  );
};

export default ClipboardCopy;
