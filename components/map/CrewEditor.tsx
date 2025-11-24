'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  MessageSquare,
  Heart,
  Fuel,
  Star,
  Target,
  Home,
  Anchor,
  Compass,
  Wind,
  CloudLightning,
  AlertTriangle,
  LifeBuoy,
  Bell,
  Users,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { ModuleDefinition, type LucideIconName } from '@/lib/map-modules';
import type { CrewContact } from '@/hooks/useMapData';

// Map icon names to actual Lucide components
const ICON_MAP: Record<LucideIconName, LucideIcon> = {
  Heart,
  Fuel,
  Star,
  Target,
  Home,
  Anchor,
  Compass,
  Wind,
  CloudLightning,
  AlertTriangle,
  LifeBuoy,
  Bell,
  Users,
  BookOpen,
  Sparkles,
};

interface CrewEditorProps {
  module: ModuleDefinition;
  initialContacts: CrewContact[];
  onSave: (contacts: Omit<CrewContact, 'id'>[]) => Promise<boolean>;
  saving: boolean;
}

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  role: string;
  can_text: boolean;
  notes: string;
}

export function CrewEditor({
  module,
  initialContacts,
  onSave,
  saving,
}: CrewEditorProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<CrewContact[]>(initialContacts);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    role: '',
    can_text: false,
    notes: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleAddContact = () => {
    if (!formData.name.trim()) return;

    const newContact: CrewContact = {
      id: `temp-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      role: formData.role.trim() || null,
      can_text: formData.can_text,
      notes: formData.notes.trim() || null,
      sort_order: contacts.length,
    };

    setContacts([...contacts, newContact]);
    setFormData({ name: '', phone: '', email: '', role: '', can_text: false, notes: '' });
    setShowAddForm(false);
  };

  const handleRemoveContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
  };

  const handleSave = async () => {
    const contactsToSave = contacts.map((c, index) => ({
      name: c.name,
      phone: c.phone,
      email: c.email,
      role: c.role,
      can_text: c.can_text,
      notes: c.notes,
      sort_order: index,
    }));

    const success = await onSave(contactsToSave);
    if (success) {
      setSaved(true);
      setTimeout(() => {
        router.push('/map');
      }, 500);
    }
  };

  const hasChanges = JSON.stringify(contacts.map(c => ({
    name: c.name,
    phone: c.phone,
    email: c.email,
    role: c.role,
    can_text: c.can_text,
    notes: c.notes,
  }))) !== JSON.stringify(initialContacts.map(c => ({
    name: c.name,
    phone: c.phone,
    email: c.email,
    role: c.role,
    can_text: c.can_text,
    notes: c.notes,
  })));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-cyan-50 pb-24 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/50 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="mx-auto max-w-lg pl-10">
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Map
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Module header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 ${module.iconColor}`}>
              {(() => {
                const IconComponent = ICON_MAP[module.iconName];
                return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
              })()}
            </div>
            <div>
              <h1 className="font-cinzel text-xl font-semibold text-slate-900 dark:text-slate-100">
                {module.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {module.shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          {module.fullDescription}
        </p>

        {/* Current contacts */}
        {contacts.length > 0 && (
          <div className="mb-4 space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {contact.name}
                      </span>
                      {contact.role && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {contact.role}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      )}
                      {contact.can_text && (
                        <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                          <MessageSquare className="h-3 w-3" />
                          Can text
                        </span>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(contact.id)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                    aria-label={`Remove ${contact.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add contact form */}
        {showAddForm ? (
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name..."
              className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoFocus
            />
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Role (e.g., accountability buddy, cheerleader)..."
              className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="mb-2 grid grid-cols-2 gap-2">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone..."
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email..."
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes (optional)..."
              rows={2}
              className="mb-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.can_text}
                  onChange={(e) => setFormData({ ...formData, can_text: e.target.checked })}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Can text them
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', phone: '', email: '', role: '', can_text: false, notes: '' });
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddContact}
                  disabled={!formData.name.trim()}
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:text-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Add a crew member
          </button>
        )}

        {/* Suggestions */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <span>Role ideas</span>
            {showSuggestions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showSuggestions && (
            <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <div className="flex flex-wrap gap-2">
                {module.suggestions.map((suggestion) => (
                  <span
                    key={suggestion}
                    className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : hasChanges
                ? 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
            } ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              'Saving...'
            ) : saved ? (
              'Saved!'
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
