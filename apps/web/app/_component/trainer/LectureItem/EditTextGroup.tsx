import {
  Group,
  TextInput,
  Button,
  Tooltip,
  Text,
  ActionIcon,
  Box,
  Flex,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconX,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import React, { FC } from "react";

type EditTextGroupProps = {
  isEditing: boolean;
  newName: string;
  name: string;
  setNewName: (name: string) => void;
  handleSave: () => void;
  setIsEditing: (bool: boolean) => void;
  onDelete: () => void;
  noDelete?: boolean;
  placeholder?: string;
};

const EditTextGroup: FC<EditTextGroupProps> = ({
  isEditing,
  newName,
  setNewName,
  handleSave,
  setIsEditing,
  onDelete,
  name,
  placeholder,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Flex align="center" onClick={(e) => e.stopPropagation()} gap="xs">
      {isEditing ? (
        <>
          <TextInput
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={placeholder ?? "Lecture Title"}
          />

          <Tooltip label="Save lecture">
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              size="md"
              aria-label="Save lecture"
            >
              <IconDeviceFloppy size={26} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Cancel">
            <ActionIcon
              color="red"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              size="md"
              aria-label="cancel save lecture"
            >
              <IconX size={20} />
            </ActionIcon>
          </Tooltip>
        </>
      ) : (
        <Group>
          <Box>
            <Text c={isDark ? "gray.3" : undefined}>{name}</Text>
          </Box>

          <Tooltip label="Edit Lecture">
            <ActionIcon
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              size="md"
              aria-label="edit lecture name"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete Lecture">
            <ActionIcon
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              size="md"
              aria-label="delete lecture"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Flex>
  );
};

export default EditTextGroup;
