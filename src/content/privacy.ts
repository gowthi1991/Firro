// Privacy notice shown at /privacy. Plain language on purpose.
// Contact email is a placeholder (see src/config/site.ts).

export const privacy = {
  label: 'Privacy',
  title: 'Privacy notice',
  updated: 'Last updated September 2026',
  intro:
    'This notice explains what happens to the details you share when you ask for a Firro demo on this website. Firro is a product of Uyir AI Labs Pvt Ltd, Coimbatore, India.',
  sections: [
    {
      h: 'What we collect',
      p: [
        'When you fill in the demo form we collect: your name, your phone number, your kitchen’s name, your city, roughly how many meals you cook a day, and — if you choose to tell us — the tools you use today. We also record that you agreed to be contacted, and the time you sent the form.',
        'To stop spam and repeated submissions we also record the type of browser you used and a scrambled, one-way code made from your internet (IP) address. We never store the IP address itself, and the code cannot be turned back into it.',
        'We do not use advertising trackers on this site, and we do not ask for payment details.',
      ],
    },
    {
      h: 'Analytics',
      p: [
        'To see how many people visit, which buttons they use and how fast pages load, we use Vercel Web Analytics and Speed Insights. They do not use cookies and do not collect your name, number or anything else that identifies you — only anonymous, aggregated counts such as page views, clicks on "Book a demo" or "Chat on WhatsApp", form submissions, and page-speed measurements.',
      ],
    },
    {
      h: 'Where it goes',
      p: [
        'When you send the form, your details are saved in a secure database run for us by Neon (a managed Postgres provider), through our website host, Vercel. A copy is emailed to the Firro team through Resend, an email delivery service, so we can call you quickly.',
        'If we connect our customer-management system (Zoho CRM, hosted in Zoho’s India data centre), your details are also added there so our team can follow up.',
        'These providers may process data on servers outside India. They act only on our instructions and may not use your details for their own purposes.',
      ],
    },
    {
      h: 'Why we collect it',
      p: [
        'Only to arrange and run your demo call: to phone you, understand how your kitchen works, and follow up about that conversation. We will not use your number for unrelated marketing.',
      ],
    },
    {
      h: 'How long we keep it',
      p: [
        'We keep your details until your enquiry is closed — for example, once the demo has happened and you have decided whether to go ahead — and for no longer than 12 months after you sent the form. After that we delete them from the database, and delete the notification emails too.',
      ],
    },
    {
      h: 'Who we share it with',
      p: [
        'We do not sell or rent your details, and we do not share them with other businesses for their own use. They are handled only by the Firro team, and by the service providers named above (Vercel, Neon, Resend and, if connected, Zoho), which store or deliver data for us under contract and only on our instructions.',
      ],
    },
    {
      h: 'Your rights',
      p: [
        'You can ask us at any time to show you the details we hold about you, correct them, or delete them. You can also withdraw your consent to be contacted — we will stop calling you and delete your details.',
        'To make a request, email us at {email}. We will reply within a reasonable time and in any case within the period the law requires.',
      ],
    },
    {
      h: 'The law we follow',
      p: [
        'We handle your details in line with India’s Digital Personal Data Protection Act, 2023. If you are not satisfied with how we have handled a request, you may raise a complaint with the Data Protection Board of India.',
      ],
    },
    {
      h: 'Changes to this notice',
      p: ['If we change how we use your details, we will update this page and the date above.'],
    },
  ],
  back: 'Back to home',
};
