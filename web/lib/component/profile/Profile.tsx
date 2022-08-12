import Avatar from '@mui/material/Avatar';
import { useSession } from 'next-auth/react';
import React from 'react';
import { ApolloGQL } from 'common';
import { Button } from '@mui/material';

export const Profile: React.FC = () => {
  const { data: session } = useSession();
  if (!session || !session.user) throw new Error('Session missing; cannot load Profile');

  const { user } = session;

  // call greeter mutation
  const [greetResponse, setGreetResponse] = React.useState<ApolloGQL.GreetingResponse>();
  const [greet] = ApolloGQL.useGreetMutation();
  const handleGreet = React.useCallback(async () => {
    const username = user.name || user.email;
    if (!username) throw new Error('User missing name or email in session');
    const { data } = await greet({ variables: { name: username } });
    setGreetResponse(data?.greet);
  }, [greet, user]);

  return (
    <div style={{ width: 400, margin: '3rem auto 0 auto' }}>
      {user.image && <Avatar src={user.image} />}

      <Button variant="contained" color="secondary" onClick={handleGreet}>
        Greet
      </Button>

      {greetResponse && <div>{greetResponse.greeting}</div>}
    </div>
  );
};
