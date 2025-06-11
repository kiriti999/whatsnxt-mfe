import {
  Group,
  Tooltip,
  Text,
  NumberInput,
  ActionIcon,
  Flex,
  Box,
} from "@mantine/core";
import { IconX, IconDeviceFloppy, IconEdit } from "@tabler/icons-react";
import React, { FC } from "react";

type EditIndexProps = {
  isEditing: boolean;
  newOrder: number;
  order: number;
  setNewOrder: (name: number) => void;
  setIsEditing: (bool: boolean) => void;
  placeholder?: string;
  totalCount: number;
  reorderLectureOrder: (
    oldOrder: number,
    newOrder: number,
    cb: () => void
  ) => void;
};

export const EditOrderIndex: FC<EditIndexProps> = ({
  isEditing,
  newOrder,
  setNewOrder,
  setIsEditing,
  order,
  placeholder,
  totalCount,
  reorderLectureOrder,
}) => {
  const handleReorderVaidations = (e) => {
    e.stopPropagation();
    if (newOrder === order) {
      setIsEditing(false);
      return;
    }
    reorderLectureOrder(order, newOrder, () => {
      setIsEditing(false);
    });
  };

  return (
    <Flex align="center" onClick={(e) => e.stopPropagation()} gap="xs">
      {isEditing ? (
        <>
          <NumberInput
            size="xs"
            max={totalCount}
            min={1}
            onClick={(e) => {
              e.stopPropagation();
            }}
            value={newOrder} // Make sure this is `newOrder` to allow editing
            onChange={(e: number) => {
              setNewOrder(e);
            }}
            placeholder={placeholder}
            styles={{ input: { textAlign: "center" } }} // Center text
          />
          <Tooltip label="Save">
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                handleReorderVaidations(e);
              }}
              size="md"
              aria-label="save order index"
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
              aria-label="cancel order index"
            >
              <IconX size={20} />
            </ActionIcon>
          </Tooltip>
        </>
      ) : (
        <Group>
          <Box>
            <Text>Order: {order}</Text>
          </Box>
          <Tooltip label="Edit Lecture">
            <ActionIcon
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              size="md"
              aria-label="edit order index"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Flex>
  );
};
