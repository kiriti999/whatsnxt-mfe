import React, { useState } from 'react';
import { Popover, Button, Group, Tooltip, ActionIcon, TextInput, Stack, Switch } from '@mantine/core';
import { IconLink, IconLinkOff, IconExternalLink } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';
import '../Link/LinkStyle.css';

interface LinkControlProps {
  editor: Editor;
}

export const LinkControl: React.FC<LinkControlProps> = ({ editor }) => {
  const [opened, setOpened] = useState(false);
  const [url, setUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const handleOpen = () => {
    const attrs = editor.getAttributes('link');
    // Initialize with existing link data if present
    setUrl(attrs.href || '');
    setOpenInNewTab(attrs.target === '_blank');
    setOpened(true);
  };

  const handleApplyLink = () => {
    // Ensure URL has protocol
    let finalUrl = url.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    // Set the link
    if (finalUrl) {
      editor
        .chain()
        .focus()
        .setLink({
          href: finalUrl,
          target: openInNewTab ? '_blank' : null
        })
        .run();
    } else {
      // If URL is empty, remove the link
      editor.chain().focus().unsetLink().run();
    }

    setOpened(false);
  };

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      withArrow
    >
      <Popover.Target>
        <Tooltip label="Add/Edit link">
          <ActionIcon
            variant="subtle"
            color="black"
            onClick={handleOpen}
          >
            <IconLink size={16} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <TextInput
            label="URL"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            rightSection={url && (
              <Tooltip label="Visit link">
                <ActionIcon
                  size="sm"
                  component="a"
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                >
                  <IconExternalLink size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          />

          <Switch
            label="Open in new tab"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.currentTarget.checked)}
          />

          <Group gap="apart" mt="sm">
            <Button
              variant="subtle"
              color="red"
              size="xs"
              leftSection={<IconLinkOff size={14} />}
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setOpened(false);
              }}
              type="button"
              disabled={!editor.getAttributes('link').href}
            >
              Remove link
            </Button>

            <Button
              onClick={handleApplyLink}
              size="xs"
              variant="filled"
              color="blue"
              type="button"
            >
              Apply
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default LinkControl;