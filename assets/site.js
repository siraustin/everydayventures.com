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

const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  const statusMessage = contactForm.querySelector('.form-message');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const defaultButtonText = submitButton?.textContent ?? 'Send message';

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (statusMessage) {
      statusMessage.textContent = 'Sending your message…';
      statusMessage.classList.remove('is-error');
      statusMessage.classList.add('is-visible');
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    contactForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute('aria-invalid');
    });

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action || '/api/contact', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = result?.message || 'We could not send your message. Please try again.';
        if (result?.errors) {
          Object.entries(result.errors).forEach(([fieldName]) => {
            const field = contactForm.querySelector(`[name="${fieldName}"]`);
            if (field) {
              field.setAttribute('aria-invalid', 'true');
            }
          });
        }
        throw new Error(message);
      }

      if (statusMessage) {
        statusMessage.textContent = result?.message || 'Thanks for reaching out! We will be in touch shortly.';
        statusMessage.classList.remove('is-error');
        statusMessage.classList.add('is-visible');
      }

      contactForm.reset();
      contactForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
        field.removeAttribute('aria-invalid');
      });
    } catch (error) {
      if (statusMessage) {
        statusMessage.textContent =
          error instanceof Error
            ? error.message
            : 'We could not send your message. Please try again.';
        statusMessage.classList.add('is-visible', 'is-error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    }
  });
}
