"use client"
import { Popover, ActionIcon, Box, Group, Tooltip } from '@mantine/core';
import { IconShare2 } from '@tabler/icons-react';
import React, { useState } from 'react';
import ClipboardCopy from './ClipBoardCopy';
import FacebookShare from './FacebookShare';
import WhatsappShare from './WhatsappShare';
import LinkedInShare from './LinkedInShare';


interface ShareOptionsProps {
  url: string;
  title?: string;
  thumbnailUrn: string;
  description?: string;
  email?: string;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({ url, title, thumbnailUrn, email, description }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom"
      withArrow
      shadow="md"
    >
      {/* Share Button */}
      <Popover.Target>
        <Tooltip label='Share'>
          <ActionIcon onClick={() => setOpened((prev) => !prev)}
            variant="subtle">
            <IconShare2 size={20} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>

      {/* Popover Content */}
      <Popover.Dropdown>
        <Box>
          <Group align="center">
            {/* WhatsApp Share */}
            <WhatsappShare url={url} />

            {/* Facebook Share */}
            <FacebookShare url={url} />

            {/* LinkedIn Share */}
            <LinkedInShare url={url} email={email} title={title} thumbnailUrn={thumbnailUrn} description={description} />

            {/* Clipboard Copy */}
            < ClipboardCopy url={url} />
          </Group>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};