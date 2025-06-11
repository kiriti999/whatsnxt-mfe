import React from "react";
import { Editor } from "@tiptap/react";
import { NumberInput, ActionIcon, Flex, Paper, TextInput, Group } from "@mantine/core";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

interface YoutubeBarProps {
    editor: Editor | null;
}

const YoutubeUploader: React.FC<YoutubeBarProps> = ({ editor }) => {
    const [height, setHeight] = React.useState<number>(480);
    const [width, setWidth] = React.useState<number>(640);

    if (!editor) {
        return null;
    }

    const addYoutubeVideo = () => {
        const url = prompt("Enter YouTube URL");

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: Math.max(320, width) || 640,
                height: Math.max(180, height) || 480,
            });
        }
    };

    const handleWidthChange = (value: number | undefined) => {
        if (value) {
            setWidth(value);
        }
    };

    const handleHeightChange = (value: number | undefined) => {
        if (value) {
            setHeight(value);
        }
    };

    return (
        <Group gap={0}>
            <ActionIcon
                onClick={addYoutubeVideo}
                size="1.9rem"
                variant="subtle"
            >
                <IconBrandYoutubeFilled size={44} stroke={2} />
            </ActionIcon>

            <TextInput
                type='number'
                min={320}
                max={1024}
                value={width}
                onChange={(event) => handleWidthChange(Number(event.target.value) || undefined)}
                size="xs"
                styles={{ input: { width: '3rem', height: '1.9rem' } }}
            />

            <TextInput
                min={180}
                max={720}
                value={height}
                onChange={(event) => handleHeightChange(Number(event.target.value) || undefined)}
                size="xs"
                styles={{ input: { width: '3rem', height: '1.9rem' } }}
            />
        </Group>
    );
};

export default YoutubeUploader;
