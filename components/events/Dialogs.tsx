// components/events/Dialogs.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { eventsApi, venuesApi, organizersApi } from "@/lib/api";
import type { Venue, Organizer } from "@/lib/api";

// ============================================
// Event Dialog
// ============================================
interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: Venue[];
  organizers: Organizer[];
  onSuccess: () => void;
}

export function EventDialog({
  open,
  onOpenChange,
  venues,
  organizers,
  onSuccess,
}: EventDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    eventShortName: "",
    operatorLoginCode: "",
    organizerId: "",
    venueId: "",
    startDate: "",
    endDate: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        eventName: "",
        eventShortName: "",
        operatorLoginCode: "",
        organizerId: "",
        venueId: "",
        startDate: "",
        endDate: "",
      });
      setSelectedFile(null);
      setPreviewImage(null);
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await eventsApi.createEvent({
        ...formData,
        uploadEventLogo: selectedFile || undefined,
      });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                value={formData.eventName}
                onChange={(e) =>
                  setFormData({ ...formData, eventName: e.target.value })
                }
                required
                placeholder="AIG IBD Summit 2025"
              />
            </div>
            <div className="space-y-2">
              <Label>Event Short Name *</Label>
              <Input
                value={formData.eventShortName}
                onChange={(e) =>
                  setFormData({ ...formData, eventShortName: e.target.value })
                }
                required
                placeholder="IBD2025"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Operator Login Code *</Label>
            <Input
              value={formData.operatorLoginCode}
              onChange={(e) =>
                setFormData({ ...formData, operatorLoginCode: e.target.value })
              }
              required
              placeholder="IBD2025"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organizer *</Label>
              <Select
                value={formData.organizerId}
                onValueChange={(v) =>
                  setFormData({ ...formData, organizerId: v })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organizer" />
                </SelectTrigger>
                <SelectContent>
                  {organizers.map((o) => (
                    <SelectItem key={o._id} value={o._id}>
                      {o.organizerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Venue *</Label>
              <Select
                value={formData.venueId}
                onValueChange={(v) => setFormData({ ...formData, venueId: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.venueName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Event Logo</Label>
            <p className="text-xs text-neutral-500">
              Recommended size:{" "}
              <span className="font-medium">1200 × 600 px</span> (2:1 ratio),
              max 5MB
            </p>
            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-4 text-center hover:border-orange-400 transition">
              {previewImage ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="preview"
                    className="w-full max-w-md aspect-[2/1] rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setSelectedFile(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-neutral-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Click to upload event logo</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="event-logo-input"
                  />
                  <label
                    htmlFor="event-logo-input"
                    className="mt-2 inline-block px-4 py-2 bg-orange-600 text-white rounded-md cursor-pointer hover:bg-orange-700 text-sm"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Venue Dialog
// ============================================
interface VenueDialogProps {
  open: boolean;
  editing: Venue | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VenueDialog({
  open,
  editing,
  onOpenChange,
  onSuccess,
}: VenueDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    venueName: "",
    country: "",
    state: "",
    city: "",
    address: "",
    website: "",
    mapLink: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setFormData({
        venueName: editing.venueName || "",
        country: editing.country || "",
        state: editing.state || "",
        city: editing.city || "",
        address: editing.address || "",
        website: editing.website || "",
        mapLink: editing.mapLink || "",
      });
      if (editing.uploadVenuePhoto) {
        setPreviewImage(editing.uploadVenuePhoto);
      }
    } else {
      setFormData({
        venueName: "",
        country: "",
        state: "",
        city: "",
        address: "",
        website: "",
        mapLink: "",
      });
      setPreviewImage(null);
      setSelectedFile(null);
    }
  }, [editing, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await venuesApi.updateVenue(editing._id, {
          ...formData,
          uploadVenuePhoto: selectedFile || undefined,
        });
        toast({ title: "Success", description: "Venue updated successfully" });
      } else {
        await venuesApi.createVenue({
          ...formData,
          uploadVenuePhoto: selectedFile || undefined,
        });
        toast({ title: "Success", description: "Venue created successfully" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || `Failed to ${editing ? "update" : "create"} venue`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Venue" : "Add New Venue"}</DialogTitle>
          <DialogDescription>
            All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Venue Name *</Label>
            <Input
              value={formData.venueName}
              onChange={(e) =>
                setFormData({ ...formData, venueName: e.target.value })
              }
              required
              placeholder="HICC Novotel"
            />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
              placeholder="Full address"
            />
          </div>
          <div className="space-y-2">
            <Label>Venue Photo</Label>
            <p className="text-xs text-neutral-500">
              Recommended size:{" "}
              <span className="font-medium">1200 × 600 px</span> (2:1 ratio),
              max 5MB
            </p>
            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-4 text-center hover:border-orange-400 transition">
              {previewImage ? (
                <div className="relative inline-block">
                  <img
                    src={previewImage}
                    alt="venue"
                    className="w-full max-w-md aspect-[2/1] rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setSelectedFile(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-neutral-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Click to upload venue photo</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="venue-photo-input"
                  />
                  <label
                    htmlFor="venue-photo-input"
                    className="mt-2 inline-block px-4 py-2 bg-orange-600 text-white rounded-md cursor-pointer hover:bg-orange-700 text-sm"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Country *</Label>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website *</Label>
            <Input
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              required
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Google Map Link *</Label>
            <Input
              value={formData.mapLink}
              onChange={(e) =>
                setFormData({ ...formData, mapLink: e.target.value })
              }
              required
              placeholder="https://maps.google.com/..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? "Saving..." : editing ? "Save Changes" : "Add Venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Organizer Dialog
// ============================================
interface OrganizerDialogProps {
  open: boolean;
  editing: Organizer | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OrganizerDialog({
  open,
  editing,
  onOpenChange,
  onSuccess,
}: OrganizerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizerName: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonMobile: "",
  });

  useEffect(() => {
    if (editing) {
      setFormData({
        organizerName: editing.organizerName || "",
        contactPersonName: editing.contactPersonName || "",
        contactPersonEmail: editing.contactPersonEmail || "",
        contactPersonMobile: editing.contactPersonMobile || "",
      });
    } else {
      setFormData({
        organizerName: "",
        contactPersonName: "",
        contactPersonEmail: "",
        contactPersonMobile: "",
      });
    }
  }, [editing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await organizersApi.updateOrganizer(editing._id, formData);
        toast({
          title: "Success",
          description: "Organizer updated successfully",
        });
      } else {
        await organizersApi.createOrganizer(formData);
        toast({
          title: "Success",
          description: "Organizer created successfully",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${editing ? "update" : "create"} organizer`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Organizer" : "Add New Organizer"}
          </DialogTitle>
          <DialogDescription>
            All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Organizer Name *</Label>
            <Input
              value={formData.organizerName}
              onChange={(e) =>
                setFormData({ ...formData, organizerName: e.target.value })
              }
              required
              placeholder="Onsitewala"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Person Name *</Label>
            <Input
              value={formData.contactPersonName}
              onChange={(e) =>
                setFormData({ ...formData, contactPersonName: e.target.value })
              }
              required
              placeholder="Rajesh Kumar"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Person Email Id *</Label>
            <Input
              type="email"
              value={formData.contactPersonEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactPersonEmail: e.target.value })
              }
              required
              placeholder="rajesh@org.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Person Mobile No. *</Label>
            <Input
              value={formData.contactPersonMobile}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactPersonMobile: e.target.value,
                })
              }
              required
              placeholder="9876543210"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Add Organizer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
