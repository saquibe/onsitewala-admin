export type EventStatus = 'running' | 'live' | 'draft' | 'past' | 'cancelled' | 'trash';

export interface Venue {
  id: string;
  name: string;
  address: string;
  image?: string;
  city: string;
  state: string;
  country: string;
  website: string;
  googleMapLink: string;
}

export interface Organizer {
  id: string;
  organizerName: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonMobile: string;
}

export interface Event {
  id: string;
  fullName: string;
  shortName: string;
  operatorLoginCode: string;
  image?: string;
  organizerId: string;
  startDate: string;
  endDate: string;
  venueId: string;
  city: string;
  state: string;
  country: string;
  status: EventStatus;
}

export interface CategoryItem {
  id: string;
  badgeType: string;
  scanCategory: 'single' | 'multi' | 'none';
  status: 'active' | 'inactive';
  type: 'attendee' | 'certificate' | 'scan';
}

export interface Attendee {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  registrationType: string;
  mobileNumber: string;
  emailId: string;
  address: string;
}
