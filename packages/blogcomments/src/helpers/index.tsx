import React from 'react';
import { Anchor, Text } from '@mantine/core';

// Format comment text to display @username, #hashtag, and hyperlinks with theme-aware colors
export function FormatCommentText(text: any) {
  if (text) {
    const content = text?.split(/((?:#|@|https?:\/\/[^\s]+)[a-zA-Z]+)/);

    return content.map((word: string, i: number) => {
      if (word.startsWith('#')) {
        return <Text component="span" c="green" key={`${word}-${i}`}>{word}</Text>;
      } else if (word.startsWith('@')) {
        return <Text component="span" c="red" key={`${word}-${i}`}>{word}</Text>;
      } else if (word.includes('http')) {
        return (
          <Anchor target="_blank" href={word} key={`${word}-${i}`}>
            {word}
          </Anchor>
        );
      } else {
        return word;
      }
    });
  }
}

export function formatRelativeTime(date: any) {
  const currentDate: any = new Date();
  const timeDifference = currentDate - Date.parse(date);

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return years + ' year' + (years === 1 ? '' : 's') + ' ago';
  } else if (months > 0) {
    return months + ' month' + (months === 1 ? '' : 's') + ' ago';
  } else if (days > 0) {
    return days + ' day' + (days === 1 ? '' : 's') + ' ago';
  } else if (hours > 0) {
    return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
  } else if (minutes > 0) {
    return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
  } else if (seconds > 0) {
    return seconds + ' second' + (seconds === 1 ? '' : 's') + ' ago';
  } else {
    return 'just now';
  }
}

// Example usage:
// const date = new Date("2023-10-15T12:00:00"); // Replace with your date
// const relativeTime = formatRelativeTime(date);
// Output: '16 days ago'
