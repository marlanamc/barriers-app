import { createClient } from '@supabase/supabase-js';
import type { Database, Json } from './database.types';
import { isValidDateString } from './date-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if ((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && process.env.NODE_ENV === 'development') {
  console.warn('Missing Supabase environment variables. Some features may not work.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type BarrierType = Database['public']['Tables']['barrier_types']['Row'];
export type Checkin = Database['public']['Tables']['checkins']['Row'];
export type FocusItem = Database['public']['Tables']['focus_items']['Row'];
export type FocusBarrier = Database['public']['Tables']['focus_barriers']['Row'];
export type InternalWeatherStat = Database['public']['Views']['user_internal_weather_stats']['Row'];

export type CalendarEntry = Database['public']['Tables']['user_calendar_entries']['Row'];

export type PlannedItem = Database['public']['Tables']['planned_items']['Row'];
export type PlannedItemInsert = Database['public']['Tables']['planned_items']['Insert'];
export type PlannedItemUpdate = Database['public']['Tables']['planned_items']['Update'];
export type PlannedItemWithBarrier = PlannedItem & { barrier_types: BarrierType | null };

export type EnergySchedule = Database['public']['Tables']['energy_schedules']['Row'];
export type EnergyScheduleInsert = Database['public']['Tables']['energy_schedules']['Insert'];
export type EnergyScheduleUpdate = Database['public']['Tables']['energy_schedules']['Update'];

export type AnchorPreset = Database['public']['Tables']['anchor_presets']['Row'];
export type AnchorPresetInsert = Database['public']['Tables']['anchor_presets']['Insert'];
export type AnchorPresetUpdate = Database['public']['Tables']['anchor_presets']['Update'];

export interface BarrierTipMessage {
  slug: string;
  message: string;
  tone?: string | null;
}

export type FocusItemPayload = {
  id: string;
  description: string;
  categories: string[];
  sortOrder: number;
  plannedItemId?: string | null;
  anchorType?: 'at' | 'while' | 'before' | 'after' | null;
  anchorValue?: string | null;
  barrier?: {
    barrierTypeId?: string | null;
    barrierTypeSlug?: string | null;
    custom?: string | null;
  } | null;
};

export interface SaveCheckinPayload {
  userId: string;
  internalWeather: {
    key: string;
    label: string;
    icon: string;
  };
  forecastNote?: string;
  focusItems: FocusItemPayload[];
  checkinDate?: string;
}

export type FocusItemWithRelations = FocusItem & {
  focus_barriers: Array<
    FocusBarrier & {
      barrier_types: BarrierType | null;
    }
  >;
};

export type CheckinWithRelations = Checkin & {
  focus_items: FocusItemWithRelations[];
};

const focusItemsSelect = `*, focus_barriers(*, barrier_types(*))`;
const checkinSelect = `*, focus_items(${focusItemsSelect})`;
const plannedItemsSelect = `*`;

const LEGACY_NAME_FIELDS = [
  'label',
  'name',
  'title',
  'display_name',
  'barrier',
  'barrier_name',
  'short_label',
  'short_name',
  'friendly_name',
  'display_label',
  'displayLabel',
];

const LEGACY_DESCRIPTION_FIELDS = ['description', 'summary', 'subtitle', 'details', 'copy', 'intro', 'body', 'body_text'];

const LEGACY_ICON_FIELDS = ['icon', 'emoji', 'glyph', 'badge'];

const LEGACY_TIP_FIELDS = [
  'gentle_advice',
  'gentleAdvice',
  'gentle_message',
  'gentleMessage',
  'support_tip',
  'supportTip',
  'tip',
  'advice',
  'comfort',
  'encouragement',
];

function isMissingRelation(error: any, relation: string) {
  if (!error) return false;
  if (error.code === '42P01') return true;
  const message = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase();
  return message.includes(relation.toLowerCase());
}

function findFirstString(row: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function toSlug(value: string | undefined) {
  if (!value) return undefined;
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || undefined;
}

function mapLegacyBarrier(row: Record<string, any>): BarrierType {
  const now = new Date().toISOString();
  const friendlyName = findFirstString(row, LEGACY_NAME_FIELDS);
  const slugFromRow = typeof row.slug === 'string' && row.slug.trim() ? row.slug.trim() : undefined;
  const slugCandidate = slugFromRow ?? friendlyName ?? (typeof row.id === 'string' ? row.id : undefined);
  const slug = toSlug(slugCandidate) ?? `legacy-${Math.random().toString(36).slice(2)}`;
  const label = friendlyName ?? slug ?? 'Barrier';
  const description =
    findFirstString(row, LEGACY_DESCRIPTION_FIELDS) ?? (typeof row.description === 'string' ? row.description : null);
  const icon = findFirstString(row, LEGACY_ICON_FIELDS) ?? null;

  return {
    id: String(row.id ?? slug ?? `legacy-${Math.random().toString(36).slice(2)}`),
    slug,
    label,
    description,
    icon,
    created_at: row.created_at ?? now,
    updated_at: row.updated_at ?? now,
  };
}

async function fetchLegacyBarrierTypes(): Promise<BarrierType[]> {
  const { data, error } = await supabase.from('barriers_content').select('*');
  if (error) {
    console.error('Error fetching legacy barriers_content data', error);
    return [];
  }
  return (data ?? []).map(mapLegacyBarrier);
}

function sortBarrierTypes(barriers: BarrierType[]): BarrierType[] {
  return [...barriers].sort((a, b) => {
    const aLabel = (a.label ?? '').toLowerCase();
    const bLabel = (b.label ?? '').toLowerCase();
    return aLabel.localeCompare(bLabel);
  });
}

const localBarrierSeeds: Array<Pick<BarrierType, 'slug' | 'label' | 'description' | 'icon'>> = [
  { slug: 'low-energy', label: 'Low energy', description: 'Body feels heavy or drained', icon: '🪫' },
  { slug: 'no-motivation', label: 'Low motivation', description: 'Hard to convince yourself to start', icon: '😴' },
  { slug: 'decision-fatigue', label: 'Decision fatigue', description: 'Too many choices to pick from', icon: '💭' },
  { slug: 'stuck-frozen', label: 'Stuck / frozen', description: 'Brain feels frozen or paralyzed', icon: '🧊' },
  { slug: 'cant-focus', label: "Can't focus", description: 'Mind keeps drifting away', icon: '🎯' },
  { slug: 'overwhelm', label: 'Overwhelmed', description: 'Too many tabs open at once', icon: '🌀' },
  { slug: 'no-time', label: 'No time', description: 'Schedule already feels too full', icon: '⏰' },
  { slug: 'perfection-loop', label: 'Perfection loop', description: 'Feels like it has to be perfect', icon: '🔄' },
  { slug: 'keep-avoiding-it', label: 'Keep avoiding it', description: 'Keeps sliding to tomorrow', icon: '🗓' },
  { slug: 'shame-guilt', label: 'Shame or guilt', description: 'Heavy feelings after delaying it', icon: '💔' },
  { slug: 'waiting-on-someone', label: 'Waiting on someone', description: 'Need a reply or approval first', icon: '💬' },
  { slug: 'feeling-alone', label: 'Feeling alone', description: 'Wish someone could sit with you', icon: '🧍' },
];

function buildFallbackBarrierTypes(): BarrierType[] {
  const timestamp = new Date('2024-01-01T00:00:00.000Z').toISOString();
  const list: BarrierType[] = localBarrierSeeds.map((seed, index) => ({
    id: `local-barrier-${index}`,
    slug: seed.slug,
    label: seed.label,
    description: seed.description,
    icon: seed.icon,
    created_at: timestamp,
    updated_at: timestamp,
  }));
  return sortBarrierTypes(list);
}

function buildDefaultTips(barrierTypes: BarrierType[]): BarrierTipMessage[] {
  return barrierTypes.map((barrier) => ({
    slug: barrier.slug,
    message: barrier.label
      ? `Offer one small kindness toward "${barrier.label}". Start tiny and breathe.`
      : 'Offer one small kindness toward this focus. Start tiny and breathe.',
    tone: 'gentle',
  }));
}

export async function saveCheckinWithFocus(payload: SaveCheckinPayload): Promise<string> {
  // SECURITY: Client-side validation before sending to database
  // This provides immediate feedback and reduces server load
  
  // Validate user ID format (UUID)
  if (!payload.userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.userId)) {
    throw new Error('Invalid user ID format');
  }
  
  // Validate internal weather
  if (!payload.internalWeather?.key || typeof payload.internalWeather.key !== 'string') {
    throw new Error('Internal weather is required');
  }
  
  // Validate forecast note length
  if (payload.forecastNote && payload.forecastNote.length > 1000) {
    throw new Error('Forecast note exceeds maximum length of 1000 characters');
  }
  
  // Validate focus items count
  if (payload.focusItems.length > 5) {
    throw new Error('Maximum of 5 focus items allowed');
  }
  
  // Validate and sanitize focus items
  const focusItemsJson: Json = payload.focusItems.map((item, index) => {
    // Validate description
    const description = item.description?.trim() || '';
    if (!description) {
      throw new Error(`Focus item ${index + 1} description is required`);
    }
    if (description.length > 500) {
      throw new Error(`Focus item ${index + 1} description exceeds maximum length of 500 characters`);
    }
    
    // Clean and validate anchor value
    let anchorValue: string | null = null;
    if (item.anchorValue && item.anchorType) {
      const cleaned = item.anchorValue.trim();
      if (cleaned.length > 0) {
        if (cleaned.length > 200) {
          throw new Error(`Focus item ${index + 1} anchor value exceeds maximum length of 200 characters`);
        }
        anchorValue = cleaned;
      }
    }
    
    // Validate custom barrier length
    if (item.barrier?.custom && item.barrier.custom.trim().length > 200) {
      throw new Error(`Focus item ${index + 1} custom barrier exceeds maximum length of 200 characters`);
    }
    
    // Validate categories array
    const categories = Array.isArray(item.categories) 
      ? item.categories.filter(cat => cat && typeof cat === 'string').slice(0, 10)
      : [];
    
    return {
      id: item.id,
      description: description,
      categories: categories,
      sortOrder: item.sortOrder ?? index,
      plannedItemId: item.plannedItemId ?? null,
      anchorType: item.anchorType ?? null,
      anchorValue: anchorValue,
      barrier: item.barrier
        ? {
            barrierTypeId: item.barrier.barrierTypeId ?? null,
            barrierTypeSlug: item.barrier.barrierTypeSlug ?? null,
            custom: item.barrier.custom?.trim() || null,
          }
        : null,
    };
  });

  const normalizedCheckinDate =
    payload.checkinDate && isValidDateString(payload.checkinDate) ? payload.checkinDate : null;

  if (payload.checkinDate && !normalizedCheckinDate) {
    console.warn('Invalid check-in date provided, defaulting to today.', payload.checkinDate);
  }

  const rpcParams = {
    p_user_id: payload.userId,
    p_internal_weather: payload.internalWeather.key,
    p_weather_icon: payload.internalWeather.icon ?? null,
    p_forecast_note: payload.forecastNote?.trim() || null,
    p_focus_items: focusItemsJson,
    p_checkin_date: normalizedCheckinDate ?? undefined,
  };

  const { data, error } = await supabase.rpc('create_checkin_with_focus', rpcParams);

  if (error) {
    console.error('Error saving check-in');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('Error code:', error.code);
    console.error('RPC params:', JSON.stringify(rpcParams, null, 2));
    console.error('Focus items:', JSON.stringify(focusItemsJson, null, 2));
    
    // Create a more helpful error message
    const errorMessage = error.message || error.details || error.hint || 'Something went wrong while saving.';
    throw new Error(errorMessage);
  }

  if (!data || typeof data !== 'string') {
    throw new Error('Check-in was saved but no ID was returned.');
  }

  return data;
}

function mapLegacyTip(row: Record<string, any>): BarrierTipMessage | null {
  const slug = toSlug(typeof row.slug === 'string' ? row.slug : String(row.id ?? ''));
  const message = findFirstString(row, LEGACY_TIP_FIELDS);
  if (!slug || !message) {
    return null;
  }
  return {
    slug,
    message,
    tone: null,
  };
}

async function fetchLegacyTips(barrierTypes: BarrierType[]): Promise<BarrierTipMessage[]> {
  const slugs = barrierTypes.map((type) => type.slug).filter(Boolean);
  if (!slugs.length) return [];

  const { data, error } = await supabase
    .from('barriers_content')
    .select('*')
    .in('slug', slugs as string[]);

  if (error) {
    console.warn('Error fetching legacy tips from barriers_content, using defaults', error);
    return buildDefaultTips(barrierTypes);
  }

  const slugSet = new Set(slugs);
  const mapped = (data ?? [])
    .map(mapLegacyTip)
    .filter((tip): tip is BarrierTipMessage => Boolean(tip && slugSet.has(tip.slug)));

  if (!mapped.length) {
    return buildDefaultTips(barrierTypes);
  }

  return mapped;
}

export async function getBarrierTypes() {
  try {
    const { data, error } = await supabase
      .from('barrier_types')
      .select('*')
      .order('label', { ascending: true });

    if (error) {
      if (isMissingRelation(error, 'barrier_types')) {
        console.warn('Falling back to barriers_content for barrier options');
        const legacy = await fetchLegacyBarrierTypes();
        if (legacy.length) {
          return sortBarrierTypes(legacy);
        }
      } else {
        console.error('Error fetching barrier types', error);
      }
      return buildFallbackBarrierTypes();
    }

    const normalized = sortBarrierTypes((data ?? []) as BarrierType[]);
    if (!normalized.length) {
      return buildFallbackBarrierTypes();
    }
    return normalized;
  } catch (error) {
    console.error('Unexpected error fetching barrier types', error);
    return buildFallbackBarrierTypes();
  }
}

export async function getTipsForBarrierTypes(barrierTypes: BarrierType[]): Promise<BarrierTipMessage[]> {
  if (!barrierTypes.length) return [];

  const barrierTypeIds = barrierTypes.map((type) => type.id).filter((id): id is string => Boolean(id));
  const slugById = new Map(barrierTypes.map((type) => [type.id, type.slug]));

  if (barrierTypeIds.length) {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .in('barrier_type_id', barrierTypeIds);

    if (error) {
      if (isMissingRelation(error, 'tips')) {
        console.warn('Tips table missing; using gentle_advice from barriers_content');
        return fetchLegacyTips(barrierTypes);
      }
      console.warn('Error fetching tips; falling back to defaults', error);
      return buildDefaultTips(barrierTypes);
    }

    const mapped = (data as Database['public']['Tables']['tips']['Row'][] || [])
      .map((tip) => {
        const slug = slugById.get(tip.barrier_type_id ?? '') ?? null;
        if (!slug) return null;
        return {
          slug,
          message: tip.message,
          tone: tip.tone ?? null,
        } as BarrierTipMessage;
      })
      .filter(Boolean);

    if (mapped.length) {
      return mapped as BarrierTipMessage[];
    }
  }

  return fetchLegacyTips(barrierTypes);
}

export async function getCheckinsForRange(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('checkins')
    .select(checkinSelect)
    .eq('user_id', userId)
    .gte('checkin_date', startDate)
    .lte('checkin_date', endDate)
    .order('checkin_date', { ascending: true })
    .order('sort_order', { ascending: true, referencedTable: 'focus_items' });

  if (error) {
    console.error('Error fetching checkins', error);
    return [] as CheckinWithRelations[];
  }

  return (data ?? []) as unknown as CheckinWithRelations[];
}

export async function getCheckinByDate(userId: string, date: string) {
  // With the unique constraint (user_id, checkin_date), there's only one checkin per user per date
  // No need to order by created_at since the constraint guarantees uniqueness
  const { data, error } = await supabase
    .from('checkins')
    .select(checkinSelect)
    .eq('user_id', userId)
    .eq('checkin_date', date)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching check-in by date', error);
    return null;
  }

  return data ? (data as unknown as CheckinWithRelations) : null;
}

export async function getInternalWeatherStats(userId: string) {
  const { data, error } = await supabase
    .from('user_internal_weather_stats')
    .select('*')
    .eq('user_id', userId)
    .order('occurrence_count', { ascending: false });

  if (error) {
    console.error('Error fetching weather stats', error);
    return [] as InternalWeatherStat[];
  }

  return data as InternalWeatherStat[];
}

export async function getCalendarEntries(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('user_calendar_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching calendar entries:', error);
    return [];
  }

  return data;
}

// ==========================================
// PLANNED ITEMS CRUD FUNCTIONS
// ==========================================

/**
 * Create a new planned item (one-time or recurring)
 */
export async function createPlannedItem(plannedItem: PlannedItemInsert): Promise<PlannedItem | null> {
  const { data, error } = await supabase
    .from('planned_items')
    .insert(plannedItem)
    .select()
    .single();

  if (error) {
    console.error('Error creating planned item:', error);
    throw error;
  }

  return data as PlannedItem;
}

/**
 * Helper function to fetch and join barrier types for planned items
 * This reduces code duplication and ensures consistent behavior
 */
async function enrichPlannedItemsWithBarriers(
  plannedItems: PlannedItem[]
): Promise<PlannedItemWithBarrier[]> {
  if (!plannedItems || plannedItems.length === 0) {
    return [];
  }

  // Fetch barrier types separately and join manually
  const barrierTypeIds = [...new Set(plannedItems.map(item => item.barrier_type_id).filter(Boolean) as string[])];
  const barrierTypesMap = new Map<string, BarrierType>();

  if (barrierTypeIds.length > 0) {
    const { data: barrierTypes, error: barrierError } = await supabase
      .from('barrier_types')
      .select('*')
      .in('id', barrierTypeIds);

    if (barrierError) {
      console.warn('Error fetching barrier types for planned items:', barrierError);
    } else if (barrierTypes) {
      barrierTypes.forEach(bt => {
        barrierTypesMap.set(bt.id, bt as BarrierType);
      });
      
      // Warn if some barrier types weren't found
      const foundIds = new Set(barrierTypes.map(bt => bt.id));
      const missingIds = barrierTypeIds.filter(id => !foundIds.has(id));
      if (missingIds.length > 0) {
        console.warn(`Some barrier types not found for planned items: ${missingIds.join(', ')}`);
      }
    }
  }

  return plannedItems.map(item => ({
    ...item,
    barrier_types: item.barrier_type_id ? (barrierTypesMap.get(item.barrier_type_id) ?? null) : null,
  })) as PlannedItemWithBarrier[];
}

/**
 * Get all planned items for a user
 */
export async function getPlannedItems(userId: string): Promise<PlannedItemWithBarrier[]> {
  const { data, error } = await supabase
    .from('planned_items')
    .select(plannedItemsSelect)
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching planned items:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return enrichPlannedItemsWithBarriers(data as PlannedItem[]);
}

/**
 * Get planned items that may apply to a specific date
 * This returns all items where the date falls within the recurrence range
 * Actual filtering by recurrence pattern happens in the client using recurrence.ts
 */
export async function getPlannedItemsForDate(userId: string, date: string): Promise<PlannedItemWithBarrier[]> {
  const { data, error } = await supabase
    .from('planned_items')
    .select(plannedItemsSelect)
    .eq('user_id', userId)
    .lte('start_date', date)
    .or(`end_date.is.null,end_date.gte.${date}`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching planned items for date:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return enrichPlannedItemsWithBarriers(data as PlannedItem[]);
}

/**
 * Update a planned item
 */
export async function updatePlannedItem(
  itemId: string,
  updates: PlannedItemUpdate
): Promise<PlannedItem | null> {
  const { data, error } = await supabase
    .from('planned_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating planned item:', error);
    throw error;
  }

  return data as PlannedItem;
}

/**
 * Delete a planned item
 */
export async function deletePlannedItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('planned_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting planned item:', error);
    return false;
  }

  return true;
}

// ==========================================
// ENERGY SCHEDULE CRUD FUNCTIONS
// ==========================================

/**
 * Get all energy schedules for a user
 */
export async function getEnergySchedules(userId: string): Promise<EnergySchedule[]> {
  const { data, error } = await supabase
    .from('energy_schedules')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('start_time_minutes', { ascending: true });

  if (error) {
    console.error('Error fetching energy schedules:', error);
    return [];
  }

  return (data ?? []) as EnergySchedule[];
}

/**
 * Create a new energy schedule
 */
export async function createEnergySchedule(schedule: EnergyScheduleInsert): Promise<EnergySchedule | null> {
  const { data, error } = await supabase
    .from('energy_schedules')
    .insert(schedule)
    .select()
    .single();

  if (error) {
    console.error('Error creating energy schedule:', error);
    throw error;
  }

  return data as EnergySchedule;
}

/**
 * Update an energy schedule
 */
export async function updateEnergySchedule(
  scheduleId: string,
  updates: EnergyScheduleUpdate
): Promise<EnergySchedule | null> {
  const { data, error } = await supabase
    .from('energy_schedules')
    .update(updates)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) {
    console.error('Error updating energy schedule:', error);
    throw error;
  }

  return data as EnergySchedule;
}

/**
 * Delete an energy schedule
 */
export async function deleteEnergySchedule(scheduleId: string): Promise<boolean> {
  const { error } = await supabase
    .from('energy_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error('Error deleting energy schedule:', error);
    return false;
  }

  return true;
}

/**
 * Get the current energy level based on schedule
 * Returns the energy key that should be active at the current time
 */
export async function getCurrentEnergyFromSchedule(userId: string): Promise<{
  energy_key: 'sparky' | 'steady' | 'flowing' | 'foggy' | 'resting';
  schedule: EnergySchedule | null;
  nextTransition: EnergySchedule | null;
} | null> {
  const schedules = await getEnergySchedules(userId);
  
  if (schedules.length === 0) {
    return null;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Sort schedules by time
  const sortedSchedules = [...schedules].sort((a, b) => a.start_time_minutes - b.start_time_minutes);
  
  // Find the current energy level
  // If it's before the first schedule, use the last schedule of the previous day
  let currentSchedule: EnergySchedule | null = null;
  let nextTransition: EnergySchedule | null = null;
  
  for (let i = 0; i < sortedSchedules.length; i++) {
    const schedule = sortedSchedules[i];
    const nextSchedule = sortedSchedules[i + 1];
    
    if (currentMinutes >= schedule.start_time_minutes) {
      if (!nextSchedule || currentMinutes < nextSchedule.start_time_minutes) {
        currentSchedule = schedule;
        nextTransition = nextSchedule || sortedSchedules[0]; // Wrap around to first schedule next day
        break;
      }
    }
  }
  
  // If before first schedule, use last schedule (from previous day)
  if (!currentSchedule && sortedSchedules.length > 0) {
    currentSchedule = sortedSchedules[sortedSchedules.length - 1];
    nextTransition = sortedSchedules[0];
  }
  
  if (!currentSchedule) {
    return null;
  }

  return {
    energy_key: currentSchedule.energy_key as 'sparky' | 'steady' | 'flowing' | 'foggy' | 'resting',
    schedule: currentSchedule,
    nextTransition,
  };
}

// ==========================================
// USER PROFILE PREFERENCES FUNCTIONS
// ==========================================

/**
 * Get user profile with preferences
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, any>
): Promise<boolean> {
  // First, try to get existing profile
  const existing = await getUserProfile(userId);

  if (existing) {
    // Update existing profile, merging preferences
    const existingPrefs = (existing.preferences as Record<string, any>) || {};
    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferences: { ...existingPrefs, ...preferences },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  } else {
    // Create new profile
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        preferences,
      });

    if (error) {
      console.error('Error creating user profile:', error);
      return false;
    }
  }

  return true;
}

/**
 * Get custom tags from user preferences
 */
export async function getCustomTags(userId: string): Promise<string[]> {
  const profile = await getUserProfile(userId);
  if (!profile?.preferences) return [];
  const prefs = profile.preferences as Record<string, any>;
  return (prefs.customTags as string[]) || [];
}

/**
 * Set custom tags in user preferences
 */
export async function setCustomTags(userId: string, tags: string[]): Promise<boolean> {
  return updateUserPreferences(userId, { customTags: tags });
}

/**
 * Get anchor presets for a user by type
 */
export async function getAnchorPresets(
  userId: string,
  anchorType: 'at' | 'while' | 'before' | 'after'
): Promise<string[]> {
  const { data, error } = await supabase
    .from('anchor_presets')
    .select('preset_value')
    .eq('user_id', userId)
    .eq('anchor_type', anchorType)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    // Silently handle missing table (migration not run yet)
    if (error.code === '42P01') {
      return [];
    }
    console.error('Error fetching anchor presets:', error);
    return [];
  }

  return data.map((row) => row.preset_value);
}

/**
 * Set anchor presets for a user by type
 */
export async function setAnchorPresets(
  userId: string,
  anchorType: 'at' | 'while' | 'before' | 'after',
  presets: string[]
): Promise<boolean> {
  // Delete existing presets for this type
  const { error: deleteError } = await supabase
    .from('anchor_presets')
    .delete()
    .eq('user_id', userId)
    .eq('anchor_type', anchorType);

  if (deleteError) {
    console.error('Error deleting existing anchor presets:', deleteError);
    return false;
  }

  // Insert new presets
  if (presets.length > 0) {
    const inserts = presets.map((preset, index) => ({
      user_id: userId,
      anchor_type: anchorType,
      preset_value: preset.trim(),
      sort_order: index,
    }));

    const { error: insertError } = await supabase
      .from('anchor_presets')
      .insert(inserts);

    if (insertError) {
      console.error('Error inserting anchor presets:', insertError);
      return false;
    }
  }

  return true;
}
