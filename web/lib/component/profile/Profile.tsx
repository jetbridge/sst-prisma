import Avatar from '@mui/material/Avatar';
import { useSession } from 'next-auth/react';
import React from 'react';
import { ApolloGQL } from 'common';
import { Button, LinearProgress } from '@mui/material';

export const Profile: React.FC = () => {
  // get current user
  const { data: session } = useSession();
  if (!session || !session.user) throw new Error('Session missing; cannot load Profile');
  const { user } = session;

  // call greeter mutation
  const [greetResponse, setGreetResponse] = React.useState<ApolloGQL.GreetingResponse>();
  const [greet, { loading: greetingLoading }] = ApolloGQL.useGreetMutation();
  const handleGreet = React.useCallback(async () => {
    const username = user.name || user.email;
    if (!username) throw new Error('User missing name or email in session');
    const { data } = await greet({ variables: { name: username } });
    setGreetResponse(data?.greet);
  }, [greet, user]);

  return (
    <div style={{ width: 400, margin: '3rem auto 0 auto' }}>
      {greetingLoading && (
        <div>
          <LinearProgress value={0} />
        </div>
      )}
      {greetResponse && (
        <div style={{ display: 'flex', alignItems: 'center', margin: 12 }}>
          {user.image && <Avatar src={user.image} />}
          <div style={{ padding: 10 }}>{greetResponse.greeting}</div>
        </div>
      )}

      <Button variant="contained" color="primary" onClick={handleGreet} disabled={greetingLoading}>
        Greet
      </Button>
    </div>
  );
};
