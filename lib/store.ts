'use client';

import { Event, Venue, Organizer, CategoryItem, Attendee } from './types';

const SAMPLE_VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'HICC Novotel',
    address: 'Novotel Hyderabad Convention Centre, Near Hitex Exhibition Centre',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    website: 'https://novotel.com',
    googleMapLink: 'https://maps.google.com',
  },
  {
    id: 'v2',
    name: 'Auditorium, AIG Hospitals',
    address: 'Survey No. 136, Mindspace Road, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    website: 'https://aighosp.in',
    googleMapLink: 'https://maps.google.com',
  },
];

const SAMPLE_ORGANIZERS: Organizer[] = [
  {
    id: 'o1',
    organizerName: 'OnsiteWala',
    contactPersonName: 'Rajesh Kumar',
    contactPersonEmail: 'rajesh@onsitewala.in',
    contactPersonMobile: '+91 9876543210',
  },
  {
    id: 'o2',
    organizerName: 'AIG Events',
    contactPersonName: 'Priya Sharma',
    contactPersonEmail: 'priya@aigevents.com',
    contactPersonMobile: '+91 9123456789',
  },
];

const SAMPLE_EVENTS: Event[] = [
  {
    id: 'e1',
    fullName: 'AIG IBD Summit 2025',
    shortName: 'IBD2025',
    operatorLoginCode: 'IBD2025',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400',
    organizerId: 'o1',
    startDate: '2025-04-25',
    endDate: '2025-04-27',
    venueId: 'v1',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    status: 'live',
  },
  {
    id: 'e2',
    fullName: 'Gut, Liver & Lifelines',
    shortName: 'GLL2025',
    operatorLoginCode: 'GLL2025',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
    organizerId: 'o2',
    startDate: '2025-06-01',
    endDate: '2025-06-01',
    venueId: 'v2',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    status: 'live',
  },
  {
    id: 'e3',
    fullName: 'Cardiology Annual Meet 2025',
    shortName: 'CAM2025',
    operatorLoginCode: 'CAM2025',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    organizerId: 'o1',
    startDate: '2025-03-10',
    endDate: '2025-03-12',
    venueId: 'v1',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    status: 'past',
  },
];

const SAMPLE_CATEGORIES: CategoryItem[] = [
  { id: 'c1', badgeType: 'Delegate', scanCategory: 'single', status: 'active', type: 'attendee' },
  { id: 'c2', badgeType: 'Speaker', scanCategory: 'multi', status: 'active', type: 'attendee' },
  { id: 'c3', badgeType: 'Exhibitor', scanCategory: 'single', status: 'inactive', type: 'attendee' },
  { id: 'c4', badgeType: 'Workshop', scanCategory: 'multi', status: 'active', type: 'certificate' },
  { id: 'c5', badgeType: 'VIP', scanCategory: 'none', status: 'active', type: 'certificate' },
  { id: 'c6', badgeType: 'Entry Gate', scanCategory: 'single', status: 'active', type: 'scan' },
  { id: 'c7', badgeType: 'Hall A', scanCategory: 'multi', status: 'active', type: 'scan' },
];

const SAMPLE_ATTENDEES: Attendee[] = [
  {
    id: 'a1',
    registrationNumber: 'REG001',
    firstName: 'Amit',
    lastName: 'Sharma',
    registrationType: 'Delegate',
    mobileNumber: '9876543210',
    emailId: 'amit.sharma@email.com',
    address: '123 MG Road, Bengaluru, Karnataka',
  },
  {
    id: 'a2',
    registrationNumber: 'REG002',
    firstName: 'Priya',
    lastName: 'Patel',
    registrationType: 'Speaker',
    mobileNumber: '9123456789',
    emailId: 'priya.patel@email.com',
    address: '456 Banjara Hills, Hyderabad, Telangana',
  },
  {
    id: 'a3',
    registrationNumber: 'REG003',
    firstName: 'Rahul',
    lastName: 'Verma',
    registrationType: 'Exhibitor',
    mobileNumber: '8765432109',
    emailId: 'rahul.verma@email.com',
    address: '789 Connaught Place, New Delhi',
  },
];

// In-memory store
let venues: Venue[] = [...SAMPLE_VENUES];
let organizers: Organizer[] = [...SAMPLE_ORGANIZERS];
let events: Event[] = [...SAMPLE_EVENTS];
let categories: CategoryItem[] = [...SAMPLE_CATEGORIES];
let attendees: { [eventId: string]: Attendee[] } = {
  e1: [...SAMPLE_ATTENDEES],
  e2: [],
  e3: [],
};

export function getVenues() { return [...venues]; }
export function getOrganizers() { return [...organizers]; }
export function getEvents() { return [...events]; }
export function getCategories(eventId: string) { return [...categories]; }
export function getAttendees(eventId: string) { return attendees[eventId] || []; }

export function addVenue(v: Omit<Venue, 'id'>) {
  const newV = { ...v, id: `v${Date.now()}` };
  venues = [...venues, newV];
  return newV;
}

export function addOrganizer(o: Omit<Organizer, 'id'>) {
  const newO = { ...o, id: `o${Date.now()}` };
  organizers = [...organizers, newO];
  return newO;
}

export function addEvent(e: Omit<Event, 'id'>) {
  const newE = { ...e, id: `e${Date.now()}` };
  events = [...events, newE];
  attendees[newE.id] = [];
  return newE;
}

export function updateCategory(id: string, updates: Partial<CategoryItem>) {
  categories = categories.map(c => c.id === id ? { ...c, ...updates } : c);
}

export function deleteCategory(id: string) {
  categories = categories.filter(c => c.id !== id);
}

export function addCategory(item: Omit<CategoryItem, 'id'>) {
  const newC = { ...item, id: `c${Date.now()}` };
  categories = [...categories, newC];
  return newC;
}

export function addAttendee(eventId: string, a: Omit<Attendee, 'id'>) {
  const newA = { ...a, id: `a${Date.now()}` };
  if (!attendees[eventId]) attendees[eventId] = [];
  attendees[eventId] = [...attendees[eventId], newA];
  return newA;
}

export function addAttendeesFromCsv(eventId: string, rows: Omit<Attendee, 'id'>[]) {
  if (!attendees[eventId]) attendees[eventId] = [];
  const newRows = rows.map(r => ({ ...r, id: `a${Date.now()}-${Math.random()}` }));
  attendees[eventId] = [...attendees[eventId], ...newRows];
}

export function getEventById(id: string) {
  return events.find(e => e.id === id);
}

export function getVenueById(id: string) {
  return venues.find(v => v.id === id);
}

export function getOrganizerById(id: string) {
  return organizers.find(o => o.id === id);
}
