'use client';

import { Button, Group } from '@mantine/core';
import { useAppDispatch } from '../../../../store/hooks';
import { addShape } from 'diagram-core';

function ShapePalette() {
  const dispatch = useAppDispatch();

  const handleAddBox = () => {
    const newShape = {
      id: `box-${Date.now()}`,
      type: 'box',
      position: { x: 50, y: 50 },
      size: { width: 100, height: 50 },
      properties: { text: 'New Box' },
    };
    dispatch(addShape(newShape));
  };

  return (
    <Group>
      <Button onClick={handleAddBox}>Add Box</Button>
    </Group>
  );
}

export default ShapePalette;