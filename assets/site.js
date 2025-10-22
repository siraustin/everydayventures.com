// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    const hidden = !expanded ? 'false' : 'true';
    navList.setAttribute('aria-hidden', hidden);
  });

  // Close menu when a link is clicked (mobile)
  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navList.setAttribute('aria-hidden', 'true');
    });
  });

  // Initialize hidden state for accessibility
  navToggle.setAttribute('aria-expanded', 'false');
  navList.setAttribute('aria-hidden', 'true');
}

// Update year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Ignore if it's just "#" or if it's the home link
    if (href === '#' || href === '#home') {
      if (href === '#home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Add fade-in animation to product cards and process steps
const animatedElements = document.querySelectorAll('.product-card, .process-step, .workshop-path');
animatedElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  fadeInObserver.observe(el);
});

// Parallax effect for hero section
let lastScrollY = window.pageYOffset;
const hero = document.querySelector('.hero');

function updateParallax() {
  if (hero) {
    const scrolled = window.pageYOffset;
    const heroHeight = hero.offsetHeight;

    if (scrolled < heroHeight) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      hero.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
    }
  }
  lastScrollY = window.pageYOffset;
}

// Throttle parallax for performance
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
});

// Add hover effect to product cards - subtle rotation
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-4px) rotate(-0.5deg)';
  });

  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) rotate(0deg)';
  });
});

// Animate badges on scroll
const badges = document.querySelectorAll('.badge');
badges.forEach((badge, index) => {
  badge.style.opacity = '0';
  badge.style.transform = 'scale(0.8)';
  badge.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
});

const badgeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'scale(1)';
    }
  });
}, observerOptions);

badges.forEach(badge => badgeObserver.observe(badge));

// Form submission handler (placeholder - update with actual form handling)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // TODO: Replace with actual form submission logic
    console.log('Form submitted:', data);

    // Show success message (placeholder)
    alert('Thanks for reaching out! We\'ll get back to you within two business days.');
    contactForm.reset();
  });
}

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('.section[id]');
const navLinks = document.querySelectorAll('.nav-list a');

function updateActiveNav() {
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.style.color = 'var(--sage-dark)';
        }
      });
    }
  });
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateActiveNav();
      ticking = false;
    });
    ticking = true;
  }
});

// Easter egg: Konami code for fun message
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      console.log('🎉 You found the inventor\'s secret code! We love curious minds.');
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

// Add subtle animation to step numbers in "How It's Made"
const stepNumbers = document.querySelectorAll('.step-number');
stepNumbers.forEach(num => {
  num.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

  const parent = num.closest('.process-step');
  if (parent) {
    parent.addEventListener('mouseenter', () => {
      num.style.transform = 'scale(1.1) rotate(5deg)';
      num.style.boxShadow = '6px 6px 0 var(--terracotta)';
    });

    parent.addEventListener('mouseleave', () => {
      num.style.transform = 'scale(1) rotate(0deg)';
      num.style.boxShadow = '4px 4px 0 var(--terracotta)';
    });
  }
});

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  updateActiveNav();
  updateParallax();
});
