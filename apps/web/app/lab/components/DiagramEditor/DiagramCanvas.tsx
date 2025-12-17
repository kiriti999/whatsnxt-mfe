'use client';

import React from 'react';
import { useAppSelector } from '../../../../store/hooks';
import { selectShapes } from 'diagram-core';
import { Box } from '@mantine/core';

const renderShape = (shape: any) => {
  switch (shape.type) {
    case 'box':
      return <Box key={shape.id} {...shape} />;
    default:
      return null;
  }
};

function DiagramCanvas() {
  const shapes = useAppSelector(selectShapes);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        border: '1px solid #ccc',
      }}
    >
      {Object.values(shapes).map(renderShape)}
    </div>
  );
}

export default DiagramCanvas;