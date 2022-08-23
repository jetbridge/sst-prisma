import React, { useEffect, useRef, useState } from 'react';

import STACK from './Stack';

import styles from './Splash.module.scss';

const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;

const Splash = () => {
  const [drops, setDrops] = useState<JSX.Element[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const techIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(
      () =>
        setDrops((c) =>
          c.concat(
            <div
              className={styles.drop}
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
    <div className={styles.root} ref={rootRef}>
      <div className={styles.background}>{drops}</div>
      <h1>Next+SST</h1>
      <p>
        Provided by {/* eslint-disable-next-line react/jsx-no-target-blank */}
        <a href="https://jetbridge.com" target="_blank" rel="noopener">
          JetBridge
        </a>
      </p>
    </div>
  );
};

export default Splash;
