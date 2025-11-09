import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// DATABASE TYPES
// ==========================================

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  timezone: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  selected_barriers: string[];
  selected_tasks: string[];
  notes: string | null;
  mood_level: number | null;
  energy_level: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BarrierSelection {
  id: string;
  check_in_id: string;
  user_id: string;
  barrier_slug: string;
  barrier_name: string;
  issue_description: string | null;
  selected_at: string;
}

export interface TaskSelection {
  id: string;
  check_in_id: string;
  user_id: string;
  task_slug: string;
  task_name: string;
  is_completed: boolean;
  completed_at: string | null;
  selected_at: string;
}

export interface LifeAreaSelection {
  id: string;
  check_in_id: string;
  user_id: string;
  life_area_slug: string;
  life_area_name: string;
  note: string | null;
  selected_at: string;
}

export interface CalendarEntry {
  id: string;
  user_id: string;
  date: string;
  barrier_count: number;
  task_count: number;
  completed_task_count: number;
  top_barriers: string[];
  has_check_in: boolean;
  created_at: string;
  updated_at: string;
}

// Content types from ADHD First Aid (read-only)
export interface ContentPage {
  id: string;
  content_type_id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  emoji: string | null;
  intro_paragraph: string;
  gentle_advice: string;
  stern_advice: string;
  adhd_reasons: string[];
  content_sections: any[];
  meta_data: Record<string, any>;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// CONTENT QUERIES (Read from ADHD First Aid)
// ==========================================

/**
 * Get all published barriers from content_pages
 * Optionally limit the number returned
 */
export async function getBarriers(limit?: number) {
  let query = supabase
    .from('content_pages')
    .select(`
      *,
      content_types!inner(name)
    `)
    .eq('is_published', true)
    .eq('content_types.name', 'barrier')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching barriers:', error);
    return [];
  }

  return data as ContentPage[];
}

/**
 * Get all published tasks from content_pages
 */
export async function getTasks() {
  const { data, error } = await supabase
    .from('content_pages')
    .select(`
      *,
      content_types!inner(name)
    `)
    .eq('is_published', true)
    .eq('content_types.name', 'task')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data as ContentPage[];
}

/**
 * Get barrier by slug
 */
export async function getBarrierBySlug(slug: string) {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching barrier:', error);
    return null;
  }

  return data as ContentPage;
}

/**
 * Get task by slug
 */
export async function getTaskBySlug(slug: string) {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return null;
  }

  return data as ContentPage;
}

/**
 * Get all published life_areas from tasks_content table
 */
export async function getLifeAreas() {
  // First, try to get all records to see the structure
  let query = supabase
    .from('tasks_content')
    .select('*');

  // Try with is_published filter first
  const { data: dataWithFilter, error: errorWithFilter } = await query.eq('is_published', true);
  
  if (!errorWithFilter && dataWithFilter && dataWithFilter.length > 0) {
    console.log('Found life areas with is_published filter:', dataWithFilter.length);
    return mapTasksContentToContentPage(dataWithFilter);
  }

  // If that fails, try without the filter
  const { data, error } = await supabase
    .from('tasks_content')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching life areas from tasks_content:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // Try to see what tables exist
    const { data: tables } = await supabase.rpc('get_tables', {});
    console.log('Available tables (if RPC exists):', tables);
    
    return [];
  }

  if (!data || data.length === 0) {
    console.warn('No life areas found in tasks_content table');
    console.log('Query returned:', data);
    return [];
  }

  console.log('Found life areas (without filter):', data.length);
  console.log('Sample item structure:', data[0]);
  
  return mapTasksContentToContentPage(data);
}

function mapTasksContentToContentPage(data: any[]): ContentPage[] {
  return data.map((item: any) => ({
    id: item.id || item.uuid || '',
    content_type_id: item.content_type_id || '',
    name: item.name || item.title || '',
    slug: item.slug || '',
    subtitle: item.subtitle || null,
    emoji: item.emoji || null,
    intro_paragraph: item.intro_paragraph || item.intro || '',
    gentle_advice: item.gentle_advice || item.tip || item.advice || '',
    stern_advice: item.stern_advice || '',
    adhd_reasons: item.adhd_reasons || [],
    content_sections: item.content_sections || [],
    meta_data: item.meta_data || {},
    is_published: item.is_published !== undefined ? item.is_published : true,
    sort_order: item.sort_order || item.order || 0,
    created_at: item.created_at || '',
    updated_at: item.updated_at || '',
  })) as ContentPage[];
}

/**
 * Get life_area by slug from tasks_content table
 */
export async function getLifeAreaBySlug(slug: string) {
  let query = supabase
    .from('tasks_content')
    .select('*')
    .eq('slug', slug);

  // Try with is_published filter first
  const { data: dataWithFilter, error: errorWithFilter } = await query.eq('is_published', true).single();
  
  if (!errorWithFilter && dataWithFilter) {
    return mapTasksContentToContentPage([dataWithFilter])[0];
  }

  // If that fails, try without the filter
  const { data, error } = await supabase
    .from('tasks_content')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching life_area from tasks_content:', error);
    return null;
  }

  return mapTasksContentToContentPage([data])[0];
}

// ==========================================
// USER PROFILE QUERIES
// ==========================================

/**
 * Get or create user profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching user profile:', error);
    return null;
  }

  // If no profile exists, create one
  if (!data) {
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user profile:', createError);
      return null;
    }

    return newProfile as UserProfile;
  }

  return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data as UserProfile;
}

// ==========================================
// CHECK-IN QUERIES
// ==========================================

/**
 * Create a new daily check-in
 */
export async function createCheckIn(
  userId: string,
  checkInData: {
    check_in_date?: string;
    selected_barriers: string[];
    selected_tasks: string[];
    notes?: string;
    mood_level?: number;
    energy_level?: number;
  }
) {
  const today = checkInData.check_in_date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_check_ins')
    .insert({
      user_id: userId,
      check_in_date: today,
      selected_barriers: checkInData.selected_barriers || [],
      selected_tasks: checkInData.selected_tasks || [],
      notes: checkInData.notes || null,
      mood_level: checkInData.mood_level || null,
      energy_level: checkInData.energy_level || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating check-in:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return null;
  }

  return data as DailyCheckIn;
}

/**
 * Get check-ins for a user
 */
export async function getUserCheckIns(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('check_in_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }

  return data as DailyCheckIn[];
}

/**
 * Get check-in for a specific date
 */
export async function getCheckInByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('check_in_date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching check-in:', error);
    return null;
  }

  return data as DailyCheckIn | null;
}

// ==========================================
// CALENDAR QUERIES
// ==========================================

/**
 * Get calendar entries for a user (date range)
 */
export async function getCalendarEntries(
  userId: string,
  startDate: string,
  endDate: string
) {
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

  return data as CalendarEntry[];
}

/**
 * Get user barrier patterns (most common barriers)
 */
export async function getUserBarrierPatterns(userId: string) {
  const { data, error } = await supabase
    .from('user_barrier_patterns')
    .select('*')
    .eq('user_id', userId)
    .order('selection_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching barrier patterns:', error);
    return [];
  }

  return data;
}
