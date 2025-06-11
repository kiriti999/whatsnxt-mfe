import React from 'react'

// Format comment text to display @username with red and #text with green and hyperlinks with blue color
export function FormatText(text: any) {
  if (text) {
    let content = text?.split(/((?:#|@|https?:\/\/[^\s]+)[a-zA-Z]+)/);
    let hashtag;
    let username;

    return content.map((word: string) => {
      if (word.startsWith('#')) {
        hashtag = word.replace('#', '');
        // eslint-disable-next-line react/jsx-key
        return <a style={{ color: 'green' }}>{word}</a>;
      } else if (word.startsWith('@')) {
        username = word.replace('@', '');
        // eslint-disable-next-line react/jsx-key
        return <a style={{ color: 'red' }}>{word}</a>;
      } else if (word.includes('http')) {
        return (
          // eslint-disable-next-line react/jsx-key
          <a target="_blank" href={word} style={{ color: 'blue' }}>
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

  // alert(JSON.stringify(date))

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
