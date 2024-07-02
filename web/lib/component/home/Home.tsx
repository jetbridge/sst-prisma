import React from 'react';

import { Splash } from './Splash/Splash';
import { Authentication } from '@/app/ui/LoginButton';

const Home: React.FC = () => {
  return (
    <div className="text-blue-300 flex justify-center flex-1 overflow-hidden py-0 px-8 w-full">
      <Splash />

      <div>
        <Authentication />
      </div>
    </div>
  );
};

export default Home;
