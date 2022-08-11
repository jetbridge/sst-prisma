import { Button } from '@mui/material';
import { signIn } from 'next-auth/react';

export function LoginButton() {
  return (
    <Button variant="contained" color="primary" onClick={() => signIn('cognito')}>
      Sign in
    </Button>
  );
}
