import { useSession } from 'next-auth/react';
import React from 'react';

export const Profile: React.FC = () => {
  const { data: session } = useSession();

  return (
    <div>
      <h1>Profile</h1>
      <section>
        Name: {session?.user?.name}
        <br />
        Email: {session?.user?.email}
        <br />
      </section>
    </div>
  );
};
