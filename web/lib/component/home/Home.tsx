import React from 'react';

import { Splash } from './Splash';

import styles from './Home.module.scss';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <Splash />
    </div>
  );
};

export default Home;
