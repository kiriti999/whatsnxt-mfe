import React from 'react';
import dynamic from 'next/dynamic';
import { Loader } from '@mantine/core';

// Dynamically import the LexicalEditor with a fallback loading indicator
const LexicalEditorDynamic = dynamic(
  () => import('../StructuredTutorial/Editor/LexicalEditor').then(mod => ({ default: mod.LexicalEditor })),
  {
    ssr: false,
    loading: () => <Loader size="sm" />,
  }
);

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
  onWordCountChange?: (wordCount: number) => void;
};

export const RichTextEditor = (props: RichTextEditorProps) => {
  return (
    <LexicalEditorDynamic
      value={props.content}
      onChange={props.onChange}
      onWordCountChange={props.onWordCountChange}
    />
  );
};
