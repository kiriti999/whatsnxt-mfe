import React from 'react';
import router from 'next/router';

export function useSaved(unsaved: boolean) {
  React.useEffect(() => {
    if (unsaved) {
      window.onbeforeunload = () => true;
      const changeStart = () => {
        const yes = confirm('You have unsaved changes');
        if (!yes) {
          router.events.emit('routeChangeError');
          throw 'Ignore error';
        }
      };

      router.events.on('routeChangeStart', changeStart);
      return () => {
        window.onbeforeunload = null;
        router.events.off('routeChangeStart', changeStart);
      };
    } else {
      window.onbeforeunload = null;
    }
  }, [unsaved]);
}
