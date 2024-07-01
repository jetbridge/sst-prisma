import { authenticate } from '../actions';

export const LoginButton = () => {
  return (
    <form action={authenticate}>
      <button type="submit">Login</button>
    </form>
  );
};
