let revealObserver;

export function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');

  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px'
    });
  }

  elements.forEach((element) => revealObserver.observe(element));
}
