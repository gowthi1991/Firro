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
  /** Name exactly as on the certificate of incorporation (used on /about). */
  registeredName: 'Uyir AI Labs Private Limited',
  /** ISO date of incorporation (certificate of incorporation, 18 September 2025). */
  incorporated: '2025-09-18',
  /** Corporate Identity Number, MCA. Public record. */
  cin: 'U62011TZ2025PTC036108',
  /** DPIIT startup recognition certificate number (issued 21 Jan 2026, valid to 17 Sep 2035). */
  dpiitCertificate: 'DIPP240204',
  /** Udyam registration number (micro enterprise). */
  udyam: 'UDYAM-TN-03-0340943',
};

/** The founder shown on /about. No photo or social links by the owner's choice. */
export const FOUNDER = {
  name: 'Gowtham Venkatesh R',
  role: 'Founder & CEO',
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
