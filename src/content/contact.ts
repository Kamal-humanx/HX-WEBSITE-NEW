/** Contact page copy — verbatim from Figma frame 5376:3969. */

export const CONTACT = {
  heading: "Every Great Idea Needs A Co‑Conspirator",
  form: {
    fullName: { label: "Full Name*", placeholder: "Jane Doe" },
    contact: { label: "Contact ", placeholder: "XXXXX XXXXX" },
    email: { label: "Email Address*", placeholder: "jane@company.com" },
    company: { label: "Company*", placeholder: "Your company or website" },
    budget: { label: "Roughly, what's your budget?*", options: ["$25k – $50k", "$50k – $100k", "$100k+", "Not sure yet"] },
    message: {
      label: "What brings you here today?*",
      placeholder: "We'd love to hear your story, your challenge or simply what you're thinking about...",
    },
    submit: "Start Something New",
    note: "*We usually reply within 48 hours.",
  },
  /**
   * Validation + status messages. NOT in Figma — newly written, minimal, and listed in REPORT.md
   * for copy approval.
   */
  messages: {
    required: "This field is required.",
    email: "Enter a valid email address.",
    budget: "Choose a budget range.",
    sending: "Sending…",
    success: "Thank you, your message has been sent.",
    error: "Something went wrong. Please try again in a moment.",
    phone: "Enter a valid phone number.",
    tooShort: "Please add a little more detail.",
    tooLong: "This is too long. Please shorten it.",
    tooFast: "That was quick. Please wait a few seconds and send again.",
    rateLimited: "You have sent several messages already. Please try again in an hour.",
    botCheck: "We could not verify your browser. Please reload the page and try again.",
    staleForm: "This form has expired. Please send it again.",
  },
  /** Thank-you pop-up shown after a successful submission. NOT in Figma — newly written. */
  thanks: {
    title: "Thank you",
    body: "Your note has reached us. Our team will respond within 48 hours.",
    cta: "Back To The Site",
    close: "Close",
  },
  where: {
    title: "Where We Are",
    intro: "Come by, say hello, and spend some time with the people and ideas behind HumanX.",
    hoursLabel: "Hours",
    emailLabel: "Email",
    mapsCta: "View On Maps",
  },
  faq: {
    title: "Questions People Usually Ask",
    items: [
      {
        q: "Do I need a detailed brief?",
        a: "Not necessarily. A detailed brief isn’t required to get started. A high-level overview of what you’re looking to achieve, the key requirements, and any important context should be enough. From there, I can help shape the direction and ask for any additional details or clarification where needed.",
      },
      /* The four answers below are not in Figma. They were written for answer engines (AEO) from
         facts on humanx.io and this site: the capabilities list, the client list, the studio card and
         the form's 48-hour reply note. Each opens with the direct answer. */
      {
        q: "Can we start with just an idea?",
        a: "Yes. Many of our projects begin with an idea rather than a finished brief. Through product discovery, UX research and innovation workshops, we work with your team to turn it into a clear direction, co-creating the solution with you and agreeing on the metrics that matter from day one.",
      },
      {
        q: "Do you work internationally?",
        a: "Yes. HumanX is based in Mumbai and partners with CXOs and product teams around the world. Our clients include global names such as JLL, Grubhub and DBS, alongside Amazon, Apollo 24|7 and Bengaluru International Airport in India.",
      },
      {
        q: "Can we visit the studio?",
        a: "Yes, we would love to have you. The HumanX studio is at 201, Chintamani Avenue, Goregaon East, Mumbai, and is open Monday to Friday, 9:00 to 19:00 IST. Send us a note through the form on this page first, so the right people are here to meet you.",
      },
      {
        q: "How quickly can projects begin?",
        a: "We usually reply to a new enquiry within 48 hours. An introductory conversation follows to agree the scope, and the start date then depends on the size of the project and the team it needs. We work in small, expert teams, which helps us get moving quickly.",
      },
    ] as { q: string; a?: string }[],
  },
};
