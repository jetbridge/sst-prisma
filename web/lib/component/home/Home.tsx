import React from 'react';

import { Splash } from './Splash/Splash';

const Home: React.FC = () => {
  return (
    <div className=" items-center text-blue-300 flex justify-center h-full overflow-hidden py-0 px-8 w-full">
      <Splash />
    </div>
  );
};

export default Home;
