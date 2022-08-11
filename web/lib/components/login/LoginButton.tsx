import { Button } from '@mui/material';
import { useSession, signIn, signOut } from 'next-auth/react';

export function LoginButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <Button variant="contained" color="primary" onClick={() => signOut()}>
          Sign out
        </Button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <Button variant="contained" color="primary" onClick={() => signIn('cognito')}>
        Sign in
      </Button>
    </>
  );
}
