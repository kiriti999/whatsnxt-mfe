import React from 'react';
import dynamic from 'next/dynamic';
import { Loader } from '@mantine/core';

// Dynamically import the RichTextEditor with a fallback loading indicator
const Tiptap = dynamic(() => import('./Tiptap'), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <Loader size="sm" />, // Show a loading spinner while the component loads
});


type TipTapEditorProps = {
  content: string;
  onChange: (content: string) => void;
  onWordCountChange?: (wordCount: number) => void;
};


export const RichTextEditor = (props: TipTapEditorProps) => {
  return <Tiptap content={props.content} onChange={props.onChange} onWordCountChange={props.onWordCountChange} />
};
