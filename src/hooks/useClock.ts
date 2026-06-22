import { useState, useEffect } from 'react';

export function useClock() {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    const intervalId = setInterval(updateClock, 1000);
    updateClock();

    return () => clearInterval(intervalId);
  }, []);

  return timeString;
}
