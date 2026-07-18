const revealObserver = new IntersectionObserver((entries) => {
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

export function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');
  elements.forEach((element) => revealObserver.observe(element));
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', initRevealAnimations);
  window.addEventListener('resize', initRevealAnimations);
}
