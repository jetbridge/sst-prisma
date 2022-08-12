import { AppBar } from '@mui/material';
import React from 'react';
import styles from './Home.module.scss';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <AppBar>Next+SST</AppBar>
      <h1>Welcome to Next.js and SST</h1>
      <h2>We&apos;re in region {process.env.NEXT_PUBLIC_REGION}</h2>
    </div>
  );
};

export default Home;
