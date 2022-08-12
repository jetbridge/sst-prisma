import Button from '@mui/material/Button';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Profile } from '../profile/Profile';
import { LoginButton } from './LoginButton';

export const Login: React.FC = () => {
  const router = useRouter();

  const error = router.query.error as string;
  const errorDescription = router.query.error_description as string;

  const { data: session } = useSession();
  if (session) {
    return (
      <div>
        <Profile />
        <Button variant="contained" color="secondary" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div>
          <h2>Error</h2>
          {errorDescription}
        </div>
      )}

      <LoginButton />
    </div>
  );
};
