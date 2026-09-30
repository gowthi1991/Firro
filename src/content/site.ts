// All page copy, verbatim from handoff/design/reference/firro-home-v3.html.
// Headings with an italic accent are split into `title` + `accent` (rendered as <em class="acc">).
// Do not edit wording here without design sign-off.

export interface Accented {
  title: string;
  accent: string;
}

export const nav = {
  links: [
    { href: '#how', label: 'How it works' },
    { href: '#batch', label: 'Batch cooking' },
    { href: '#nutrition', label: 'Nutrition' },
    { href: '#platform', label: 'Platform' },
    { href: '#faq', label: 'FAQ' },
  ],
  cta: 'Book a demo',
  homeLabel: 'Firro home',
  menuLabel: 'Menu',
};

export const hero = {
  chip: 'Now piloting in Coimbatore',
  titleWords: ['Firro', 'plans', "tomorrow's", 'prep', 'from'],
  titleAccent: "today's subscriptions.",
  sub: 'One operating system for subscription and tiffin kitchens. Point of sale, kitchen admin, customer app and delivery — all reading the same plan, so nobody re-types a pause.',
  primaryCta: 'Book a demo',
  secondaryCta: 'Chat on WhatsApp',
  trust: ['DPIIT-recognised startup', 'Nutrition on every dish', 'GST-ready billing'],
  plateLabel:
    'Illustration of a power bowl: rice, grilled chicken, greens, corn, tomato and egg. 520 kcal, protein 42g, carbs 48g, fat 16g, fibre 9g.',
  chips: [
    { angle: 0, dot: '#2E6B47', label: 'Protein', value: '42g' },
    { angle: 72, dot: '#1F5C3A', label: 'Fibre', value: '9g' },
    { angle: 144, dot: '#9DBFA5', label: 'Carbs', value: '48g' },
    { angle: 216, dot: '#E5BE6E', label: 'Fat', value: '16g' },
    { angle: 288, dot: '#0E3320', label: 'kcal', value: '520', valueFirst: true },
  ],
  pause: {
    label: 'Subscription',
    time: '07:12',
    title: 'Priya paused Thursday lunch.',
    body: 'Prep sheet updated. No call needed.',
  },
  prep: {
    label: 'Tomorrow · Lunch',
    ready: 'Ready',
    title: 'Prep sheet',
    rows: [
      { dish: 'Chicken power bowl', count: '47', was: '48' },
      { dish: 'Paneer tikka bowl', count: '36' },
      { dish: 'Dal khichdi, Jain', count: '11' },
    ],
    locksPrefix: 'Locks at',
    locksTime: '21:00',
    locksSuffix: 'tonight',
  },
  delivery: {
    title: 'Lunch is on the way.',
    body: "Karthik's 12 minutes out.",
  },
  sample: 'Sample data',
};

export const feed = {
  label: 'A day in the kitchen',
  sample: 'Sample kitchen',
  items: [
    { time: '07:12', event: 'Priya paused Thursday lunch', detail: 'prep sheet updated' },
    { time: '21:00', event: 'Tomorrow locked', detail: 'counts frozen per dish, per diet' },
    { time: '06:00', event: 'Prep sheet ready', detail: 'lunch batch, 142 meals' },
    { time: '11:40', event: 'Packing started', detail: 'one ticket per parcel' },
    { time: '12:30', event: 'Lunch out the door', detail: 'every parcel tracked' },
  ],
};

export const problem = {
  label: 'Sound familiar?',
  heading: { title: 'Your kitchen runs on WhatsApp, a register and', accent: 'memory.' },
  lead: 'It works at 40 meals a day. At 200 it starts to crack — usually at 6am.',
  cards: [
    {
      n: '01',
      title: 'Pauses arrive as messages.',
      body: 'Skips, swaps and "no rice tomorrow" come in all day. Someone has to remember every one before prep starts.',
    },
    {
      n: '02',
      title: 'Prep is a morning guess.',
      body: "Without a live count of who's eating what, you over-cook, under-cook, or find out at the packing table.",
    },
    {
      n: '03',
      title: 'Your regulars pay a middleman.',
      body: 'Every marketplace order pays a commission. The people who eat with you every week deserve a direct line.',
    },
  ],
};

export const how = {
  label: 'How it works',
  heading: { title: 'A day in a Firro', accent: 'kitchen.' },
  lead: "Customers change their plans. Firro turns those changes into tonight's lock, the morning's prep sheet and the lunch run — on its own.",
  steps: [
    {
      time: 'All day',
      title: 'Customers manage their plans.',
      body: 'Skip, swap or pause from the customer app — inside the cutoffs you set.',
      delay: 300,
    },
    {
      time: 'Cutoff',
      title: 'Tomorrow locks.',
      body: 'Firro freezes the meal count per dish, per diet, per slot. No late surprises.',
      delay: 1200,
    },
    {
      time: 'Morning',
      title: 'The prep sheet is waiting.',
      body: 'Batch KOTs print for the line, one ticket per parcel for packing.',
      delay: 2100,
    },
    {
      time: 'Meal time',
      title: 'Out the door, tracked.',
      body: 'Parcels leave with their own ticket; customers see when lunch is close.',
      delay: 3000,
    },
  ],
};

export const batch = {
  label: 'Batch cooking',
  heading: { title: 'Cook once per slot.', accent: 'Not once per order.' },
  lead: 'Subscription meals are known the night before. Firro rolls every order in a lunch or dinner slot into one prep sheet, so your kitchen cooks to the gram and runs one line instead of a hundred tickets.',
  checks: [
    {
      title: 'Less waste.',
      body: 'Exact quantities per dish, per diet — no cooking for people who paused.',
    },
    {
      title: 'Fewer hours at the stove.',
      body: 'One prep run per slot, with the line working from a single sheet.',
    },
    {
      title: 'Buy to plan.',
      body: 'Ingredient totals come straight from your recipes, so purchasing matches the menu.',
    },
    {
      title: 'One run per slot.',
      body: 'Every parcel in the lunch or dinner batch leaves together, each with its own ticket.',
    },
  ],
  cta: 'See it with my numbers',
  ticketsLabel: 'Order by order',
  tickets: [
    { id: '#1041', dish: 'Power bowl' },
    { id: '#1042', dish: 'Khichdi' },
    { id: '#1043', dish: 'Power bowl' },
    { id: '#1044', dish: 'Paneer bowl' },
    { id: '#1045', dish: 'Power bowl' },
    { id: '#1046', dish: 'Khichdi' },
  ],
  more: '… and 136 more',
  sheet: {
    label: 'Lunch batch · 142 meals',
    time: '06:00',
    title: 'Prep sheet',
    rows: [
      { item: 'Rice, cooked', qty: '18.4' },
      { item: 'Chicken, marinated', qty: '9.6' },
      { item: 'Paneer, cubed', qty: '4.2' },
      { item: 'Moong dal', qty: '3.1' },
      { item: 'Salad, mixed', qty: '7.0' },
    ],
    unit: 'kg',
    note: 'Plus one packing ticket per parcel. Sample data.',
  },
};

export const nutrition = {
  label: 'The nutrition layer',
  heading: { title: 'Every meal knows', accent: "what's in it." },
  lead: 'Link a recipe to its raw ingredients once. Firro works out calories, macros and allergens for every dish and every variant — and keeps them right when the recipe changes.',
  checks: [
    {
      title: 'Calculated, never typed.',
      body: "Nutrition comes from ingredient links, not a chef's guess in a text box.",
    },
    {
      title: 'Allergens you can stand behind.',
      body: 'A fixed list aligned with FSSAI labelling, rolled up from every ingredient.',
    },
    {
      title: 'Right for each subscriber.',
      body: "Veg, non-veg and Jain variants resolve to each customer's diet at order time.",
    },
    {
      title: 'Shown where it matters.',
      body: 'Macros on the menu and in the customer app — as information, not pressure.',
    },
  ],
  card: {
    label: 'Lunch · high protein',
    dish: 'Chicken power bowl',
    dietLabel: 'Non-vegetarian',
    kcal: '520',
    kcalUnit: 'kcal',
    macros: [
      { name: 'Protein', value: '42g', width: 70, color: '#2E6B47', delay: 1400 },
      { name: 'Carbs', value: '48g', width: 55, color: '#9DBFA5', delay: 1550 },
      { name: 'Fat', value: '16g', width: 30, color: '#F0D78A', delay: 1700 },
      { name: 'Fibre', value: '9g', width: 36, color: '#1F5C3A', delay: 1850 },
    ],
    allergens: [
      { label: 'Contains milk', delay: 2300 },
      { label: 'Contains sesame', delay: 2420 },
    ],
  },
  link: { title: 'From 7 linked ingredients', body: 'Updates when the recipe changes' },
  sample: 'Sample data',
};

export const platform = {
  label: 'The platform',
  heading: { title: 'Four apps.', accent: 'One kitchen.' },
  lead: 'Built in-house on one data layer. Change something once and every app knows.',
  apps: [
    {
      where: 'At the counter',
      name: 'Firro POS',
      body: 'Orders, billing and KOTs — and it keeps printing when the internet drops.',
    },
    {
      where: 'In the office',
      name: 'Kitchen Admin',
      body: 'Menus, recipes, plans and pricing, subscribers and production — one place.',
    },
    {
      where: 'In their pocket',
      name: 'Customer App',
      body: 'Your subscribers skip, swap and order on demand.',
    },
    {
      where: 'On the road',
      name: 'Delivery Partner App',
      body: "Deliveries, handover and proof of delivery in the rider's hand.",
    },
  ],
  hood: {
    label: 'Under the hood',
    heading: { title: 'The rules a subscription kitchen', accent: 'runs on.' },
    subscriptions: {
      label: 'Subscriptions',
      title: 'Subscriptions that manage themselves.',
      body: 'Fixed plans or build-your-own. Pause, skip, swap and renew under cutoffs you set, with every change flowing straight to prep.',
      ringLabel: 'Tomorrow locks in',
      ringDefault: '04:00:53',
      ringAt: 'AT 21:00',
      cutoffs: [
        { value: '24h', label: 'Skip' },
        { value: '24h', label: 'Swap' },
        { value: '12h', label: 'Customize' },
      ],
      note: 'Example cutoffs — yours to set',
    },
    warnings: {
      label: 'Early warnings',
      status: 'In progress',
      title: 'Early warnings.',
      body: 'Flags from pause and skip patterns, so you can call a regular before they cancel.',
      flag: 'Anitha · 3 skips in 2 weeks',
      from: 'WEEK 1',
      to: 'WEEK 6',
    },
    costing: {
      label: 'Recipe costing',
      title: 'Recipe costing.',
      body: 'Ingredient cost, selling price and margin on every dish, before it reaches the menu.',
      value: '31%',
      unit: 'food cost',
      left: 'Ingredients',
      right: 'Margin',
    },
    gst: {
      label: 'GST',
      title: 'GST-ready billing.',
      body: 'Invoice numbers allocated at payment, the right tax on every item type, and no invoices on aggregator orders.',
      prefix: 'T1/2627/',
      number: '000142',
      taxes: [
        { name: 'CGST', rate: '2.5%' },
        { name: 'SGST', rate: '2.5%' },
      ],
    },
    sample: 'Sample data',
  },
};

export const pilot = {
  label: 'Pilot · Coimbatore',
  titleBefore: "We're taking on a",
  titleAccent: 'few more',
  titleAfter: 'kitchens.',
  body: "Firro is running with pilot kitchens in Coimbatore. If you cook for subscribers, we'd like to set it up with you.",
  cta: 'Book a demo',
  note: 'Pricing when we talk — every kitchen is set up differently.',
  kinds: ['Tiffin services', 'Subscription meal brands', 'Cloud and central kitchens'],
};

export const faq = {
  label: 'FAQ',
  heading: { title: 'Questions kitchens', accent: 'ask us.' },
  leadBefore: 'Something else?',
  leadLink: 'Chat on WhatsApp',
  items: [
    {
      q: 'Does the POS work without internet?',
      a: "Yes. Firro POS keeps taking orders and printing KOTs when the connection drops, and syncs everything once it's back.",
    },
    {
      q: 'What devices do I need?',
      a: 'A tablet or desktop for the counter and a network thermal printer. Kitchen Admin runs in any browser.',
    },
    {
      q: 'Who owns our data?',
      a: 'You do. Your menu, orders and subscriber list stay yours.',
    },
    {
      q: 'Where does the nutrition data come from?',
      a: 'From the raw ingredients you link to each recipe. Firro adds them up by weight, so the numbers follow your actual recipe, not a generic dish.',
    },
    {
      q: 'How much will batch cooking save us?',
      a: "It depends on your volume, menu and how you cook today. Bring a week of orders to the demo and we'll work it out with your numbers.",
    },
    {
      q: 'What does it cost?',
      a: "It depends on your kitchen's size and which apps you need. Book a demo and we'll work it out together.",
    },
  ],
};

export const demo = {
  label: 'Get started',
  heading: { title: 'See Firro on', accent: 'your own menu.' },
  lead: "Tell us how your kitchen runs. We'll call within a business day and walk you through it.",
  promises: [
    'A 30-minute call, not a sales script',
    'We set up your first plan with you',
    'No spam. Ever.',
  ],
  fields: {
    name: 'Your name',
    phone: 'Phone',
    phonePlaceholder: '+91 98765 43210',
    kitchen: 'Kitchen name',
    city: 'City',
    meals: 'Meals a day',
    mealsOptions: [
      { value: '', label: 'Pick a range' },
      { value: 'under-50', label: 'Under 50' },
      { value: '50-200', label: '50 to 200' },
      { value: '200-500', label: '200 to 500' },
      { value: '500-plus', label: '500 plus' },
    ],
    tool: 'What do you use today?',
    toolOptional: 'Optional',
    toolPlaceholder: 'Register, WhatsApp, spreadsheet, another POS',
    consent: 'I agree to be contacted about Firro.',
    consentLink: 'Privacy policy',
  },
  submit: 'Book my demo',
  note: "We'll only use your number to set up the call.",
  sent: {
    title: 'Got it.',
    body: "We'll call you within a business day to set up your demo.",
    cta: 'Chat on WhatsApp',
  },
  // Not in the reference (it has no validation/loading/error states); see docs/DECISIONS.md.
  loading: 'Booking…',
  errors: {
    name: 'Please enter your name.',
    phone: 'Enter a 10-digit Indian mobile number, like +91 98765 43210.',
    kitchen: 'Please enter your kitchen’s name.',
    city: 'Please enter your city.',
    meals: 'Pick a range.',
    consent: 'Please agree so we can contact you.',
    summary: 'Please fix the highlighted fields.',
  },
  failure: {
    title: 'That didn’t go through.',
    body: 'Please try again, or message us on WhatsApp and we’ll set up the demo there.',
    retry: 'Try again',
    whatsapp: 'Chat on WhatsApp',
  },
  // Server replies (src/pages/api/lead.ts)
  rateLimited: {
    title: 'We already have your request.',
    body: 'You’ve sent a few today, so we’ll call you soon. Need us sooner? Message us on WhatsApp.',
  },
  tooLarge: 'That was too much text to send. Please shorten your answers and try again.',
  badRequest: 'We couldn’t read that request. Please try again.',
};

export const footer = {
  tagline: 'The operating system for subscription kitchens. Made in Coimbatore.',
  productLabel: 'Product',
  productLinks: [
    { href: '#how', label: 'How it works' },
    { href: '#platform', label: 'Platform' },
    { href: '#batch', label: 'Batch cooking' },
    { href: '#nutrition', label: 'Nutrition' },
    { href: '#faq', label: 'FAQ' },
  ],
  talkLabel: 'Talk to us',
  bookDemo: 'Book a demo',
  whatsapp: 'Chat on WhatsApp',
  location: 'Coimbatore, India',
  copyright: '© 2026 Uyir AI Labs Pvt Ltd',
  dpiit: 'DPIIT-recognised startup',
  privacy: 'Privacy',
};

export const fab = { label: 'Chat on WhatsApp' };
