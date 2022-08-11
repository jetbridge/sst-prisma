import { useRouter } from 'next/router';
import { LoginButton } from './LoginButton';

export const Login: React.FC = () => {
  const router = useRouter();

  const error = router.query.error as string;
  const errorDescription = router.query.error_description as string;

  return (
    <div>
      {error && (
        <div>
          <h2>Error</h2>
          {errorDescription}
        </div>
      )}

      <h1>Login</h1>
      <LoginButton />
    </div>
  );
};
