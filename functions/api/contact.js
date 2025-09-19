const MAILCHANNELS_URL = 'https://api.mailchannels.net/tx/v1/send';

const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const sanitizeField = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim();
};

const escapeHtml = (value) =>
  (typeof value === 'string' ? value : '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });

const jsonResponse = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });

const htmlResponse = (status, message) =>
  new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>${
      status >= 400 ? 'Submission failed' : 'Submission received'
    }</title><meta name="viewport" content="width=device-width, initial-scale=1" /><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:2rem;line-height:1.6;background:#f8fafc;color:#0f172a;}main{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 20px 45px rgba(15,23,42,0.12);}h1{margin-top:0;font-size:1.75rem;}p{margin:1rem 0;}a{color:#4f46e5;text-decoration:none;}a:hover{text-decoration:underline;}</style></head><body><main><h1>${
      status >= 400 ? 'We hit a snag' : 'Thank you!'
    }</h1><p>${message}</p><p><a href="/">Return to the site</a></p></main></body></html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );

const buildEmailPayload = ({ name, email, project }, env) => {
  const recipient = sanitizeField(env?.CONTACT_RECIPIENT_EMAIL) || 'hello@everydayventures.com';
  const fromAddress = sanitizeField(env?.CONTACT_FROM_EMAIL) || `no-reply@${
    env?.CONTACT_DOMAIN || 'everydayventures.com'
  }`;

  const safeName = name.length > 60 ? `${name.slice(0, 57)}…` : name;

  const plainMessage = `Name: ${name}\nEmail: ${email}\n\nProject details:\n${project}\n`;
  const htmlMessage = `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(
    email
  )}</p><p><strong>Project details:</strong></p><p>${escapeHtml(project).replace(/\n/g, '<br />')}</p>`;

  const personalization = {
    to: [
      {
        email: recipient,
        name: 'Everyday Ventures',
      },
    ],
  };

  if (env?.CONTACT_BCC_EMAIL) {
    personalization.bcc = [
      {
        email: sanitizeField(env.CONTACT_BCC_EMAIL),
      },
    ];
  }

  return {
    personalizations: [personalization],
    from: {
      email: fromAddress,
      name: 'Everyday Ventures Website',
    },
    reply_to: {
      email,
      name,
    },
    subject: `New project inquiry from ${safeName}`,
    content: [
      {
        type: 'text/plain',
        value: plainMessage,
      },
      {
        type: 'text/html',
        value: htmlMessage,
      },
    ],
  };
};

const handleSuccess = (request, message) => {
  const acceptsJson = request.headers.get('Accept')?.includes('application/json');
  if (acceptsJson) {
    return jsonResponse(200, { success: true, message });
  }
  return htmlResponse(200, message);
};

const handleError = (request, status, message, errors) => {
  const acceptsJson = request.headers.get('Accept')?.includes('application/json');
  if (acceptsJson) {
    return jsonResponse(status, { success: false, message, errors });
  }
  return htmlResponse(status, message);
};

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();

  // Honeypot field for spam bots
  const company = sanitizeField(formData.get('company'));
  if (company) {
    return handleSuccess(request, 'Thank you! Your message has been received.');
  }

  const name = sanitizeField(formData.get('name'));
  const email = sanitizeField(formData.get('email'));
  const project = sanitizeField(formData.get('project'));

  const errors = {};
  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length > 200) {
    errors.name = 'Please keep your name under 200 characters.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }
  if (!project) {
    errors.project = 'Tell us about your project so we can help.';
  } else if (project.length > 5000) {
    errors.project = 'Project details should be fewer than 5,000 characters.';
  }

  if (Object.keys(errors).length) {
    return handleError(request, 400, 'Please correct the highlighted fields and try again.', errors);
  }

  const payload = buildEmailPayload({ name, email, project }, env);

  const response = await fetch(MAILCHANNELS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('MailChannels error:', response.status, text);
    return handleError(
      request,
      502,
      'We could not send your message right now. Please email hello@everydayventures.com directly.',
      { service: 'MailChannels error' }
    );
  }

  return handleSuccess(request, 'Thanks for reaching out! We will be in touch shortly.');
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  });
}
