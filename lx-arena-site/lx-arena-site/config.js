/* ==========================================================
   SUPABASE CONNECTION
   The publishable/anon key is safe to expose in frontend code —
   Row Level Security (schema.sql) controls what it can actually do.
========================================================== */
const SUPABASE_URL = "https://jtcryzkyferzvoxffmvl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Y3J5emt5ZmVyenZveGZmbXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI5ODMsImV4cCI6MjEwNTQ4ODk4M30.UmIqTJijC33AvbBNgURHBwIQdqMM0eL5G9CX_nKJI0E";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ==========================================================
   LX ARENA — CENTRAL CONFIG
   Edit everything here. No other file needs touching for
   prices, hours, courts, plans, or contact info to update
   across the whole site.

   NOTE: This is a portfolio/demo build, so sample courts,
   matches, and plans below are placeholder content — swap
   in real data before using this for an actual business.
========================================================== */

const FACILITY = {
  name: "LX Arena",
  tagline: "Play. Train. Compete.",
  description: "Professional futsal courts, night matches, gym facilities and a community built for players.",
  address: "Sinamangal, Kathmandu, Nepal",
  mapsQuery: "Sinamangal Kathmandu",
  phone: "+977 98XXXXXXXX",
  email: "play@lxarena.com",
  hoursDisplay: "Open daily, 06:00 – 00:00",
  social: {
    instagram: "#",
    facebook: "#",
  },
};

const COURTS = [
  { id: "court-1", name: "Court 1", type: "5-a-side, indoor turf", pricePerHour: 1800 },
  { id: "court-2", name: "Court 2", type: "6-a-side, indoor turf", pricePerHour: 2200 },
];

const TIME_SLOTS = [
  "06:00 – 07:00", "07:00 – 08:00", "08:00 – 09:00",
  "17:00 – 18:00", "18:00 – 19:00", "19:00 – 20:00",
  "20:00 – 21:00", "21:00 – 22:00", "22:00 – 23:00",
];

const NIGHT_MATCHES = [
  {
    id: "nm-1",
    title: "Friday Night Match",
    day: "Friday",
    time: "21:00 – 23:00",
    court: "Court 2",
    skillLevel: "Intermediate",
    maxPlayers: 10,
    playersJoined: 8,
    pricePerPlayer: 300,
  },
  {
    id: "nm-2",
    title: "Sunday Sunset League",
    day: "Sunday",
    time: "17:00 – 19:00",
    court: "Court 1",
    skillLevel: "Beginner-friendly",
    maxPlayers: 10,
    playersJoined: 10,
    pricePerPlayer: 250,
  },
];

const MEMBERSHIP_PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: 3500,
    duration: "30 days",
    features: ["Unlimited gym access", "2 court hours/week included", "Locker included"],
    featured: false,
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 9000,
    duration: "90 days",
    features: ["Unlimited gym access", "4 court hours/week included", "Locker + towel service", "10% off extra court bookings"],
    featured: true,
  },
  {
    id: "annual",
    name: "Annual",
    price: 30000,
    duration: "365 days",
    features: ["Unlimited gym access", "Unlimited court hours (off-peak)", "Locker + towel service", "1 free guest pass/month"],
    featured: false,
  },
];

const GYM_FACILITIES = [
  "Free weights & dumbbells (up to 40kg)",
  "Cardio machines — treadmills, rowers, bikes",
  "Strength machines — full body stations",
  "Stretching & mobility area",
  "Changing rooms with hot showers",
];

const OFFERS = [
  // Empty for now — the offers page will show "No current offers" until this has entries.
  // Example shape:
  // { title: "Weekday Off-Peak", description: "20% off court bookings before 5pm, Mon–Thu.", validity: "Ongoing", cta: "Book now" },
];

const FAQ = [
  { q: "Can I book a court online?", a: "Yes — use the Booking page to pick a date, court, and time slot directly." },
  { q: "How long can I book a court for?", a: "Slots are booked in 1-hour blocks. Contact us directly for multi-hour or full-day bookings." },
  { q: "Can I cancel my booking?", a: "Cancellations made more than 6 hours before your slot are fully refundable. Call us to cancel." },
  { q: "Do you provide footballs?", a: "Yes, futsal balls are available courtside at no extra charge." },
  { q: "Can I join a night match alone?", a: "Yes — night matches are built for solo players to join and get matched into a team on the night." },
  { q: "How does Find Opponent work?", a: "Post your team's availability and skill level, and other teams looking for a match can see it and reach out." },
  { q: "What gym memberships are available?", a: "Monthly, quarterly, and annual plans — see the Memberships page for full pricing and benefits." },
  { q: "What payment methods are accepted?", a: "Cash and mobile wallets are accepted at the facility. Online payment is not yet available." },
];

const REVIEWS = []; // Empty until real customer reviews are connected.

/* ==========================================================
   GALLERY
   imageUrl is "" until real photos exist — the gallery page
   shows a labeled placeholder tile for any item with no URL,
   and swaps in the real photo automatically once one is added.
   Add new items freely; category filters generate themselves.
========================================================== */
const GALLERY_ITEMS = [
  { id: "g1", category: "Futsal", caption: "Court 1, full turf", imageUrl: "" },
  { id: "g2", category: "Futsal", caption: "Court 2, floodlit", imageUrl: "" },
  { id: "g3", category: "Gym", caption: "Free weights area", imageUrl: "" },
  { id: "g4", category: "Gym", caption: "Cardio machines", imageUrl: "" },
  { id: "g5", category: "Facility", caption: "Changing rooms", imageUrl: "" },
  { id: "g6", category: "Facility", caption: "Facility exterior", imageUrl: "" },
  { id: "g7", category: "Players", caption: "Weekend regulars", imageUrl: "" },
  { id: "g8", category: "Night Matches", caption: "Friday night match", imageUrl: "" },
  { id: "g9", category: "Night Matches", caption: "Under the lights", imageUrl: "" },
  { id: "g10", category: "Events", caption: "Corporate booking", imageUrl: "" },
];
