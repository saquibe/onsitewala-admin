'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Plus, MapPin, Users, Calendar, Search, MoreVertical,
  Edit, Trash2, Globe, Link as LinkIcon, Mail, Phone, Building2,
  User, Image as ImageIcon, LogOut, LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getEvents, getVenues, getOrganizers, addEvent, addVenue, addOrganizer, getVenueById, getOrganizerById } from '@/lib/store';
import { Event, Venue, Organizer, EventStatus } from '@/lib/types';

type Tab = 'events' | 'venue' | 'organizer';

export default function EventsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('events');
  const [events, setEvents] = useState<Event[]>(getEvents());
  const [venues, setVenues] = useState<Venue[]>(getVenues());
  const [organizers, setOrganizers] = useState<Organizer[]>(getOrganizers());
  const [eventSearch, setEventSearch] = useState('');

  const [eventDialog, setEventDialog] = useState(false);
  const [venueDialog, setVenueDialog] = useState(false);
  const [organizerDialog, setOrganizerDialog] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [editOrganizer, setEditOrganizer] = useState<Organizer | null>(null);

  const openEvent = (id: string) => router.push(`/events/${id}/dashboard`);

  const filteredEvents = events.filter(e =>
    e.fullName.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.shortName.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.city.toLowerCase().includes(eventSearch.toLowerCase()),
  );

  const statusColor: Record<EventStatus, string> = {
    live: 'bg-green-100 text-green-700 border-green-200',
    running: 'bg-blue-100 text-blue-700 border-blue-200',
    draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    past: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    trash: 'bg-neutral-100 text-neutral-400 border-neutral-200',
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Top brand bar */}
      <header className="brand-header-gradient text-white">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div className="font-bold">RegistrationTeam</div>
            <span className="text-white/30">/</span>
            <span className="text-white/70 text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:inline">admin@saascraft.in</span>
            <button onClick={() => router.push('/')} className="text-white/70 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Mini sidebar */}
        <aside className="w-16 lg:w-20 bg-neutral-900 text-white flex flex-col items-center py-6 gap-2">
          <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <nav className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => setTab('events')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${tab === 'events' ? 'bg-white/15' : 'hover:bg-white/10'}`}
              title="Events"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTab('venue')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${tab === 'venue' ? 'bg-white/15' : 'hover:bg-white/10'}`}
              title="Venues"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTab('organizer')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${tab === 'organizer' ? 'bg-white/15' : 'hover:bg-white/10'}`}
              title="Organizers"
            >
              <Users className="w-5 h-5" />
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Tabs */}
          <div className="bg-white border-b border-neutral-200 px-6 pt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-neutral-900 capitalize">{tab === 'venue' ? 'Venues' : tab === 'organizer' ? 'Organizers' : 'Events'}</h1>
              <Button
                onClick={() => {
                  if (tab === 'events') setEventDialog(true);
                  else if (tab === 'venue') setVenueDialog(true);
                  else setOrganizerDialog(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add {tab === 'venue' ? 'Venue' : tab === 'organizer' ? 'Organizer' : 'Event'}
              </Button>
            </div>
            <div className="flex gap-6 mt-3">
              {(['events', 'venue', 'organizer'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-3 text-sm capitalize transition border-b-2 ${tab === t ? 'nav-tab-active' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
                >
                  {t === 'venue' ? 'Venues' : t === 'organizer' ? 'Organizers' : 'Events'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {tab === 'events' && (
              <>
                <div className="mb-4 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events by name or city..."
                    className="pl-10 bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredEvents.map(ev => {
                    const venue = getVenueById(ev.venueId);
                    const org = getOrganizerById(ev.organizerId);
                    return (
                      <div
                        key={ev.id}
                        onClick={() => openEvent(ev.id)}
                        className="event-card bg-white rounded-xl border border-neutral-200 overflow-hidden cursor-pointer group"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={ev.image || 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={ev.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className={`${statusColor[ev.status]} border`}>
                              {ev.status}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-7 h-7 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-neutral-700 hover:bg-white">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEvent(ev.id)}>
                                  <Edit className="w-4 h-4 mr-2" /> Open
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-orange-600 font-semibold">{ev.shortName}</div>
                          <h3 className="font-bold text-neutral-900 mt-1 line-clamp-2">{ev.fullName}</h3>
                          <div className="mt-3 space-y-1.5 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                              {ev.startDate} → {ev.endDate}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              {venue?.name}, {ev.city}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-neutral-400" />
                              {org?.organizerName}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {filteredEvents.length === 0 && (
                  <div className="text-center py-20 text-neutral-400">
                    No events found. Click "Add Event" to create one.
                  </div>
                )}
              </>
            )}

            {tab === 'venue' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {venues.map(v => (
                  <div key={v.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden event-card">
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-orange-400" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-neutral-900">{v.name}</h3>
                      <div className="mt-2 space-y-1.5 text-sm text-neutral-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-neutral-400" />
                          <span>{v.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                          {v.city}, {v.state}, {v.country}
                        </div>
                        {v.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-neutral-400" />
                            <a href={v.website} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline truncate">{v.website}</a>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditVenue(v)}>
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'organizer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {organizers.map(o => (
                  <div key={o.id} className="bg-white rounded-xl border border-neutral-200 p-5 event-card">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral-900">{o.organizerName}</h3>
                        <div className="mt-2 space-y-1.5 text-sm text-neutral-600">
                          <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-neutral-400" />{o.contactPersonName}</div>
                          <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-neutral-400" />{o.contactPersonEmail}</div>
                          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-neutral-400" />{o.contactPersonMobile}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditOrganizer(o)}>
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Event Dialog */}
      <EventDialog
        open={eventDialog}
        onOpenChange={setEventDialog}
        venues={venues}
        organizers={organizers}
        onCreate={(e) => {
          const created = addEvent(e);
          setEvents(getEvents());
          setEventDialog(false);
          openEvent(created.id);
        }}
      />

      {/* Venue Dialog */}
      <VenueDialog
        open={venueDialog || !!editVenue}
        editing={editVenue}
        onOpenChange={(o) => { if (!o) { setVenueDialog(false); setEditVenue(null); } }}
        onSubmit={(v) => {
          if (editVenue) {
            setVenues(vs => vs.map(x => x.id === editVenue.id ? { ...editVenue, ...v } : x));
          } else {
            addVenue(v);
            setVenues(getVenues());
          }
          setVenueDialog(false);
          setEditVenue(null);
        }}
      />

      {/* Organizer Dialog */}
      <OrganizerDialog
        open={organizerDialog || !!editOrganizer}
        editing={editOrganizer}
        onOpenChange={(o) => { if (!o) { setOrganizerDialog(false); setEditOrganizer(null); } }}
        onSubmit={(o) => {
          if (editOrganizer) {
            setOrganizers(os => os.map(x => x.id === editOrganizer.id ? { ...editOrganizer, ...o } : x));
          } else {
            addOrganizer(o);
            setOrganizers(getOrganizers());
          }
          setOrganizerDialog(false);
          setEditOrganizer(null);
        }}
      />
    </div>
  );
}

function EventDialog({ open, onOpenChange, venues, organizers, onCreate }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  venues: Venue[];
  organizers: Organizer[];
  onCreate: (e: Omit<Event, 'id'>) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [shortName, setShortName] = useState('');
  const [operatorLoginCode, setOperatorLoginCode] = useState('');
  const [organizerId, setOrganizerId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<EventStatus>('draft');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const venue = venues.find(v => v.id === venueId);
    onCreate({
      fullName, shortName, operatorLoginCode, organizerId,
      startDate, endDate, venueId, image,
      city: venue?.city || '', state: venue?.state || '', country: venue?.country || '',
      status,
    });
    setFullName(''); setShortName(''); setOperatorLoginCode(''); setOrganizerId('');
    setVenueId(''); setStartDate(''); setEndDate(''); setImage(''); setStatus('draft');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Create a new event. Fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="AIG IBD Summit 2025" />
            </div>
            <div className="space-y-2">
              <Label>Short Name *</Label>
              <Input value={shortName} onChange={(e) => setShortName(e.target.value)} required placeholder="IBD2025" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operator Login Code *</Label>
              <Input value={operatorLoginCode} onChange={(e) => setOperatorLoginCode(e.target.value)} required placeholder="IBD2025" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organizer *</Label>
              <Select value={organizerId} onValueChange={setOrganizerId} required>
                <SelectTrigger><SelectValue placeholder="Select organizer" /></SelectTrigger>
                <SelectContent>
                  {organizers.map(o => <SelectItem key={o.id} value={o.id}>{o.organizerName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Venue *</Label>
              <Select value={venueId} onValueChange={setVenueId} required>
                <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                <SelectContent>
                  {venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Event Image URL</Label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            {image && <img src={image} alt="preview" className="mt-2 h-24 rounded-md object-cover" />}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Create Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VenueDialog({ open, editing, onOpenChange, onSubmit }: {
  open: boolean;
  editing: Venue | null;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: Omit<Venue, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');

  useEffect(() => {
    if (editing) {
      setName(editing.name); setAddress(editing.address); setImage(editing.image || '');
      setCity(editing.city); setState(editing.state); setCountry(editing.country);
      setWebsite(editing.website); setGoogleMapLink(editing.googleMapLink);
    }
  }, [editing, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, address, image, city, state, country, website, googleMapLink });
    setName(''); setAddress(''); setImage(''); setCity(''); setState(''); setCountry(''); setWebsite(''); setGoogleMapLink('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Venue' : 'Add New Venue'}</DialogTitle>
          <DialogDescription>All fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Venue Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="HICC Novotel" />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Full address" />
          </div>
          <div className="space-y-2">
            <Label>Upload Image *</Label>
            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-orange-400 transition cursor-pointer">
              {image ? (
                <div className="relative">
                  <img src={image} alt="venue" className="mx-auto h-28 rounded-md object-cover" />
                  <button type="button" onClick={(e) => { e.preventDefault(); setImage(''); }} className="mt-2 text-xs text-red-600">Remove</button>
                </div>
              ) : (
                <div className="text-neutral-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Paste image URL or click to upload</div>
                  <Input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.pexels.com/..."
                    className="mt-3 max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} required /></div>
            <div className="space-y-2"><Label>State *</Label><Input value={state} onChange={(e) => setState(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Country *</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} required /></div>
          </div>
          <div className="space-y-2">
            <Label>Website *</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} required placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Google Map Link *</Label>
            <Input value={googleMapLink} onChange={(e) => setGoogleMapLink(e.target.value)} required placeholder="https://maps.google.com/..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">{editing ? 'Save Changes' : 'Add Venue'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrganizerDialog({ open, editing, onOpenChange, onSubmit }: {
  open: boolean;
  editing: Organizer | null;
  onOpenChange: (o: boolean) => void;
  onSubmit: (o: Omit<Organizer, 'id'>) => void;
}) {
  const [organizerName, setOrganizerName] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactPersonEmail, setContactPersonEmail] = useState('');
  const [contactPersonMobile, setContactPersonMobile] = useState('');

  useEffect(() => {
    if (editing) {
      setOrganizerName(editing.organizerName);
      setContactPersonName(editing.contactPersonName);
      setContactPersonEmail(editing.contactPersonEmail);
      setContactPersonMobile(editing.contactPersonMobile);
    }
  }, [editing, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ organizerName, contactPersonName, contactPersonEmail, contactPersonMobile });
    setOrganizerName(''); setContactPersonName(''); setContactPersonEmail(''); setContactPersonMobile('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Organizer' : 'Add New Organizer'}</DialogTitle>
          <DialogDescription>All fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Organizer Name *</Label>
            <Input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required placeholder="SaaScraft Studio" />
          </div>
          <div className="space-y-2">
            <Label>Contact Person Name *</Label>
            <Input value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} required placeholder="Rajesh Kumar" />
          </div>
          <div className="space-y-2">
            <Label>Contact Person Email Id *</Label>
            <Input type="email" value={contactPersonEmail} onChange={(e) => setContactPersonEmail(e.target.value)} required placeholder="rajesh@org.com" />
          </div>
          <div className="space-y-2">
            <Label>Contact Person Mobile No. *</Label>
            <Input value={contactPersonMobile} onChange={(e) => setContactPersonMobile(e.target.value)} required placeholder="+91 9876543210" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">{editing ? 'Save Changes' : 'Add Organizer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
