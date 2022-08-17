import { render, screen } from '@testing-library/react';
import Home from './Home';

const DEFAULT_PROPS = {};

const createComponent = () => {
  render(<Home {...DEFAULT_PROPS} />);
};

describe('Home', () => {
  it('should able to render component', () => {
    createComponent();
    expect(screen.getByText('Next+SST')).toBeTruthy();
  });
});
