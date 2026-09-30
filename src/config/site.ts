// Single source for site-wide settings. Every value marked TODO is a placeholder to fill before launch.

export const SITE_URL = 'https://getfirro.com';

/** WhatsApp Business number: country code, digits only. */
export const WHATSAPP_NUMBER = '917845551223';
/** Prefilled text for every "Chat on WhatsApp" link. */
export const WHATSAPP_MESSAGE = "Hi Firro, I'd like to know more about Firro for my kitchen.";
// encodeURIComponent leaves ' as-is; encode it too so the link is fully percent-encoded.
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE).replace(/'/g, '%27')}`;

export const CONTACT = {
  /** TODO(launch): confirm the public contact inbox. */
  email: 'hello@getfirro.com',
  city: 'Coimbatore, India',
};

export const COMPANY = {
  legalName: 'Uyir AI Labs Pvt Ltd',
  brand: 'Firro',
  locality: 'Coimbatore',
  region: 'Tamil Nadu',
  country: 'IN',
};

/** No social profiles yet — add URLs here and they flow into JSON-LD `sameAs`. */
export const SOCIAL: string[] = [];

export const SEO = {
  title: 'Firro — The operating system for subscription kitchens',
  description:
    "Firro plans tomorrow's prep from today's subscriptions. One operating system for subscription and tiffin kitchens: POS, admin, customer app and delivery.",
  themeColor: '#1F4A33',
  locale: 'en_IN',
};
