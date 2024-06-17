// ClockContext.js
import React, { createContext, useState, useEffect } from 'react';

export const TimeContext = createContext();

const ClockProvider = ({ children }) => {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return { hour: now.getHours() % 12, minute: now.getMinutes() };
  });

  // Update the time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime({ hour: now.getHours() % 12, minute: now.getMinutes() });
    }, 60000); // 60000 milliseconds = 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <TimeContext.Provider value={time}>
      {children}
    </TimeContext.Provider>
  );
};

export default ClockProvider;
