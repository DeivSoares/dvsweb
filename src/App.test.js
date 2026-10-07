import { render, screen } from '@testing-library/react';
import Main from './components/main';

test('reveals homepage content when mounted without IntersectionObserver', () => {
  const originalIntersectionObserver = global.IntersectionObserver;
  global.IntersectionObserver = undefined;

  render(<Main />);

  expect(screen.getByRole('heading', { name: 'Minhas Stacks' }).closest('.reveal'))
    .toHaveClass('visible');

  global.IntersectionObserver = originalIntersectionObserver;
});
