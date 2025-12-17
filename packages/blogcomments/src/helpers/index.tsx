import React from 'react';

// Format comment text to display @username with red and #text with green and hyperlinks with blue color
export function FormatCommentText(text: any) {
  if (text) {
    let content = text?.split(/((?:#|@|https?:\/\/[^\s]+)[a-zA-Z]+)/);
    let hashtag: any;
    let username: any;

    return content.map((word: string, i: number) => {
      if (word.startsWith('#')) {
        hashtag = word.replace('#', '');
        return <a style={{ color: 'green' }} key={`${word}-${i}`}>{word}</a>;
      } else if (word.startsWith('@')) {
        username = word.replace('@', '');
        return <a style={{ color: 'red' }} key={`${word}-${i}`}>{word}</a>;
      } else if (word.includes('http')) {
        return (
          <a target="_blank" href={word} style={{ color: 'blue' }} key={`${word}-${i}`}>
            {word}
          </a>
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
