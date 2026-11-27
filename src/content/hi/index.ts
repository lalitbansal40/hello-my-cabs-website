/**
 * The Hindi words of the /hi pages (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 9).
 *
 * ⚠️ NOT YET REVIEWED by a Hindi reader. Written by hand (no machine translation at build or
 * at runtime), in everyday Hindi as a customer would type it — "टैक्सी", "किराया", "वन-वे".
 * The pages stay noindex until it is reviewed (HINDI_LIVE in lib/indexing-tiers.ts).
 * Numbers and fares are never written here; the pages fill them from the API.
 */
export const HI_CITY: Readonly<Record<string, string>> = {
  JAIPUR: 'जयपुर',
  DELHI: 'दिल्ली',
  DELHI_AIRPORT: 'दिल्ली एयरपोर्ट',
  KOTA: 'कोटा',
  SIKAR: 'सीकर',
  AGRA: 'आगरा',
  CHANDIGARH: 'चंडीगढ़',
  HARIDWAR: 'हरिद्वार',
  AJMER: 'अजमेर',
  NOIDA: 'नोएडा',
  KHATU_SHYAM_JI: 'खाटू श्याम जी',
  JAIPUR_AIRPORT: 'जयपुर एयरपोर्ट',
};

export const hiCity = (key: string) => HI_CITY[key] ?? null;

export const HI = {
  langNote: 'This page in English',
  home: {
    title: 'हेलो माय कैब — जयपुर, दिल्ली, कोटा से वन-वे टैक्सी',
    h1: 'वन-वे और राउंड ट्रिप टैक्सी, किराया पहले से तय',
    lead: 'जयपुर, दिल्ली, कोटा, आगरा, सीकर और खाटू श्याम जी के लिए ड्राइवर के साथ गाड़ी। बुक करने से पहले हर गाड़ी का किराया दिखता है; टोल और GST बिल में अलग लिखे होते हैं।',
    routes: 'सबसे ज़्यादा खोजे जाने वाले रास्ते',
    cities: 'शहर',
  },
  route: {
    h1: (a: string, b: string) => `${a} से ${b} टैक्सी`,
    title: (a: string, b: string, price: string) => `${a} से ${b} टैक्सी ${price} से | वन-वे`,
    lead: (a: string, b: string, km: number | null, price: string | null) =>
      `${a} से ${b}${km ? ` करीब ${km} किमी` : ''}। ${price ? `वन-वे किराया ${price} से, ` : ''}वापसी का किराया नहीं — सिर्फ़ एक तरफ़ का। टोल और GST बिल में अलग।`,
    fares: 'हर गाड़ी का किराया (वन-वे)',
    car: 'गाड़ी',
    fare: 'किराया',
    book: 'बुक करें',
    call: 'कॉल करें',
    faq: 'सवाल-जवाब',
    q1: (a: string, b: string) => `${a} से ${b} टैक्सी का किराया कितना है?`,
    a1: (price: string) => `सबसे छोटी गाड़ी में वन-वे किराया ${price} से शुरू है। बड़ी गाड़ियों का किराया ऊपर की टेबल में है। टोल और GST बिल में अलग लिखे होते हैं।`,
    q2: (a: string, b: string) => `${a} से ${b} कितनी दूर है?`,
    a2: (km: number) => `सड़क से करीब ${km} किमी।`,
    q3: 'क्या एडवांस देना होता है?',
    a3: 'वेबसाइट पर बुकिंग के लिए थोड़ा एडवांस ऑनलाइन देना होता है; बाकी जैसा बुकिंग के समय दिखाया जाता है।',
  },
  city: {
    h1: (a: string) => `${a} में टैक्सी सर्विस`,
    title: (a: string, price: string) => `${a} टैक्सी सर्विस ${price} से | वन-वे कैब`,
    lead: (a: string) => `${a} से बाहर जाने के लिए ड्राइवर के साथ टैक्सी — किराया पहले से तय, 24×7।`,
    routes: (a: string) => `${a} से रास्ते और किराया`,
  },
  airport: {
    title: 'जयपुर एयरपोर्ट टैक्सी — एरिया के हिसाब से फिक्स किराया',
    h1: 'जयपुर एयरपोर्ट टैक्सी',
    lead: 'एयरपोर्ट से शहर के हर एरिया का फिक्स किराया — पार्किंग और GST शामिल। फ़्लाइट लेट हो तो इंतज़ार का समय फ़्री।',
    zones: 'एरिया के हिसाब से किराया (Dzire)',
  },
} as const;
