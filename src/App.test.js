import { render, screen } from '@testing-library/react';
import Main from './components/main';

test('reveals homepage content when mounted without IntersectionObserver', () => {
  const originalIntersectionObserver = global.IntersectionObserver;
  global.IntersectionObserver = undefined;

  render(<Main />);

  expect(screen.getByRole('heading', { name: 'Minhas Stacks' }).closest('.reveal'))
    .toHaveClass('visible');
  expect(screen.getByRole('heading', { name: 'Desenvolvimento Web' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Bots Personalizados para Discord' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Manutenção de Sites' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Manutenção de Sistemas' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Desenvolvimento de Sistemas de Gestão' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Consultoria Web' })).toBeInTheDocument();

  const serviceHeadings = screen.getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent);
  expect(serviceHeadings.indexOf('Manutenção de Sistemas')).toBe(
    serviceHeadings.indexOf('Manutenção de Sites') + 1,
  );

  const serviceLinks = screen.getAllByRole('link', { name: /Tenho interesse em .* pelo WhatsApp/ });
  expect(serviceLinks).toHaveLength(6);
  serviceLinks.forEach((link) => {
    const serviceName = link.getAttribute('aria-label')
      .replace('Tenho interesse em ', '')
      .replace(' pelo WhatsApp', '');
    const href = link.getAttribute('href');

    expect(href).toContain('https://wa.me/5522992326527?text=');
    expect(decodeURIComponent(href)).toContain(serviceName);
    expect(link).toHaveAttribute('target', '_blank');
  });

  global.IntersectionObserver = originalIntersectionObserver;
});
