import Avatar from '@mui/material/Avatar';
import { useSession } from 'next-auth/react';
import React from 'react';

export const Profile: React.FC = () => {
  const { data: session } = useSession();
  if (!session || !session.user) throw new Error('Session missing; cannot load Profile');

  const { user } = session;
  console.log(session);

  return (
    <div style={{ width: 400, margin: '3rem auto 0 auto' }}>
      {user.image && <Avatar src={user.image} />}
      <div>Hello, {user.name || user.email}</div>
    </div>
  );
};
