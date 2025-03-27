'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const ToggleSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const [isChecked, setIsChecked] = useState(theme === 'dark');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    setTheme(newState ? 'dark' : 'light');
  };

  if (!mounted) return null;

  return (
    <div className="relative h-[28px] w-[56px] md:h-[19.6px] md:w-[39.2px]">
      <label className="absolute h-[28px] w-full cursor-pointer rounded-[14px] border-[2px] border-gray-800 bg-gray-800 md:h-[19.6px] md:rounded-[9.8px] md:border-[1.4px]">
        <input
          type="checkbox"
          className="absolute hidden"
          checked={isChecked}
          onChange={handleToggle}
        />
        <span
          className={`absolute h-full w-full rounded-[14px] transition-colors duration-300 md:rounded-[9.8px] ${isChecked ? 'bg-gray-200' : ''}`}
        >
          <span
            className={`absolute top-[6px] left-[6px] h-[14px] w-[14px] rounded-full bg-gray-800 transition-all duration-300 md:top-[4.2px] md:left-[4.2px] md:h-[9.8px] md:w-[9.8px] ${isChecked ? 'translate-x-[28px] shadow-none md:translate-x-[19.6px]' : 'shadow-[inset_7px_-2px_0px_0px_rgb(216,219,224)] md:shadow-[inset_4.9px_-1.4px_0px_0px_rgb(216,219,224)]'}`}
          ></span>
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
