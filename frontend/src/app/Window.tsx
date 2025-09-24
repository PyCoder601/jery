'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectInputValue,
  setCommand,
  setInputValue,
  addHistory,
} from '@/redux/uiSlice';
import { AppDispatch } from '@/redux/store';

const Window = ({ children }: { children: React.ReactNode }) => {
  const inputValue: string = useSelector(selectInputValue);
  const dispatch: AppDispatch = useDispatch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      dispatch(setCommand(inputValue));
      dispatch(
        addHistory({
          text: inputValue,
          isUserInput: true,
          timestamp: new Date().toLocaleTimeString(),
        }),
      );
      dispatch(setInputValue(''));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto h-[80vh] w-full max-w-[75vw] rounded-lg border border-white/10 bg-[#1a202c]/60 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex h-10 w-full items-center border-b border-white/10 bg-gray-800/50 px-4">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-grow text-center font-mono text-sm text-gray-400">
          Jery - Server Monitoring
        </div>
      </div>
      <div className="h-[calc(80vh-3.5rem)] p-6">
        {children}
        <div className="flex items-center">
          <span className="mr-2 text-gray-400">{`>`}</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => dispatch(setInputValue(e.target.value))}
            onKeyDown={handleKeyDown}
            className="flex-grow border-none bg-transparent text-green-400 focus:outline-none"
            autoFocus
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-4 w-2 bg-green-400"
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Window;

