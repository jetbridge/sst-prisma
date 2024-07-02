import React from 'react';

import { Splash } from './Splash';

import styles from './Home.module.scss';
import { LoginButton } from '../login/LoginButton';

const Home: React.FC = () => {

  return (
    <div className={styles.container}>
      <Splash />

      <div>
        <LoginButton callbackUrl="/profile" />
      </div>
    </div>
  );
};

export default Home;
