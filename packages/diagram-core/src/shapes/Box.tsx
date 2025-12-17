
import React from 'react';

interface BoxProps {
    shape: {
        id: string;
        position: { x: number; y: number };
        size: { width: number; height: number };
        properties: { text: string };
    };
}

export const Box: React.FC<BoxProps> = ({ shape }) => {
    const { position, size, properties } = shape;
    return (
        <div
            style={{
                position: 'absolute',
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                border: '2px solid black',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {properties.text}
        </div>
    );
};
