import { Button } from '@mui/material';
import { signIn } from 'next-auth/react';

interface Props {
  callbackUrl?: string;
}

export function LoginButton({ callbackUrl }: Props) {
  return (
    <Button variant="contained" color="primary" onClick={() => signIn('cognito', { callbackUrl })}>
      Sign in
    </Button>
  );
}
