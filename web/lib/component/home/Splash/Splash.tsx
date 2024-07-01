'use client';

import React, { useEffect, useRef, useState } from 'react';

import STACK from './Stack';

const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;

export const Splash = () => {
  const [drops, setDrops] = useState<JSX.Element[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const techIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(
      () =>
        setDrops((c) =>
          c.concat(
            <div
              className="animate-fade"
              key={`tile-${techIndex.current}`}
              style={{ left: getRandomNumber(0, rootRef.current?.clientWidth || 600), top: getRandomNumber(50, 300) }}
              onAnimationEnd={() => setDrops((c) => c.slice(1))}
            >
              {STACK[techIndex.current++ % STACK.length]}
            </div>
          )
        ),
      1000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center flex-co relative w-[700px]" ref={rootRef}>
      <div className="h-full left-0 absolute top-0 w-full z-0">{drops}</div>
      <h1 className="text-6xl text-white m-0 relative shadow-md">Next+SST</h1>
      <p className="m-0 z-10">
        Provided by {/* eslint-disable-next-line react/jsx-no-target-blank */}
        <a href="https://jetbridge.com" target="_blank" rel="noopener">
          JetBridge
        </a>
      </p>
    </div>
  );
};
