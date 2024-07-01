import { authenticate, unauthenticate } from '../actions';

export const LoginButton = () => {
  return (
    <div>
      <form action={authenticate}>
        <button type="submit">Login</button>
      </form>

      <form action={unauthenticate}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
};
