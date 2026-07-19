// Context.js
import React, { createContext, useState, useEffect } from 'react';
import storage from './Storage';

const AppContext = createContext();

const ContextProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const getData = async () => {
    try {
      storage.load({ key: 'tasks', id: '1' })
        .then(ret => {
          if (ret == undefined) {
            ret = [];
          }
          setTasks(ret);
          console.log('Tasks loaded:', JSON.stringify(ret));
        })
        .catch(err => {
          console.warn(err.message);
          switch (err.name) {
            case 'NotFoundError':
              setTasks([]);
              console.log('NotFoundError');
              break;
            case 'ExpiredError':
              console.log('ExpiredError');
              break;
          }
        });
    } catch (e) {
      console.log("error in getData ");
      console.dir(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // Time state management
  const [time, setTime] = useState(() => {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  });

  // Update the time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime({ hour: now.getHours(), minute: now.getMinutes() });
    }, 60000); // 60000 milliseconds = 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{ tasks, setTasks, time }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, ContextProvider };
