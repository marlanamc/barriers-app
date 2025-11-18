export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      barrier_types: {
        Row: {
          id: string;
          slug: string;
          label: string;
          description: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          label?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      barriers_content: {
        Row: Record<string, Json | undefined>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: [];
      };
      tips: {
        Row: {
          id: string;
          barrier_type_id: string | null;
          message: string;
          tone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barrier_type_id?: string | null;
          message: string;
          tone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          barrier_type_id?: string | null;
          message?: string;
          tone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          checkin_date: string;
          internal_weather: string;
          weather_icon: string | null;
          forecast_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_date?: string;
          internal_weather: string;
          weather_icon?: string | null;
          forecast_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          checkin_date?: string;
          internal_weather?: string;
          weather_icon?: string | null;
          forecast_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      focus_items: {
        Row: {
          id: string;
          checkin_id: string;
          user_id: string;
          description: string;
          categories: string[];
          sort_order: number;
          anchor_type: string | null;
          anchor_value: string | null;
          anchors: Json;
          task_type: string;
          complexity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          checkin_id: string;
          user_id: string;
          description: string;
          categories?: string[];
          sort_order?: number;
          anchor_type?: string | null;
          anchor_value?: string | null;
          anchors?: Json;
          task_type?: string;
          complexity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          checkin_id?: string;
          user_id?: string;
          description?: string;
          categories?: string[];
          sort_order?: number;
          anchor_type?: string | null;
          anchor_value?: string | null;
          anchors?: Json;
          task_type?: string;
          complexity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      focus_barriers: {
        Row: {
          id: string;
          focus_item_id: string;
          checkin_id: string;
          user_id: string;
          barrier_type_id: string | null;
          custom_barrier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          focus_item_id: string;
          checkin_id: string;
          user_id: string;
          barrier_type_id?: string | null;
          custom_barrier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          focus_item_id?: string;
          checkin_id?: string;
          user_id?: string;
          barrier_type_id?: string | null;
          custom_barrier?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      planned_items: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          categories: string[];
          recurrence_type: 'once' | 'daily' | 'weekly' | 'monthly';
          start_date: string;
          end_date: string | null;
          recurrence_days: number[] | null;
          barrier_type_id: string | null;
          custom_barrier: string | null;
          anchor_type: 'at' | 'while' | 'before' | 'after' | null;
          anchor_value: string | null;
          anchors: Json;
          task_type: string;
          complexity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          categories?: string[];
          recurrence_type: 'once' | 'daily' | 'weekly' | 'monthly';
          start_date: string;
          end_date?: string | null;
          recurrence_days?: number[] | null;
          barrier_type_id?: string | null;
          custom_barrier?: string | null;
          anchor_type?: 'at' | 'while' | 'before' | 'after' | null;
          anchor_value?: string | null;
          anchors?: Json;
          task_type?: string;
          complexity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          categories?: string[];
          recurrence_type?: 'once' | 'daily' | 'weekly' | 'monthly';
          start_date?: string;
          end_date?: string | null;
          recurrence_days?: number[] | null;
          barrier_type_id?: string | null;
          custom_barrier?: string | null;
          anchor_type?: 'at' | 'while' | 'before' | 'after' | null;
          anchor_value?: string | null;
          anchors?: Json;
          task_type?: string;
          complexity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_calendar_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          focus_count: number;
          internal_weather: string | null;
          weather_icon: string | null;
          has_check_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          focus_count?: number;
          internal_weather?: string | null;
          weather_icon?: string | null;
          has_check_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          focus_count?: number;
          internal_weather?: string | null;
          weather_icon?: string | null;
          has_check_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      energy_schedules: {
        Row: {
          id: string;
          user_id: string;
          start_time_minutes: number;
          energy_key: string;
          label: string | null;
          notify_on_transition: boolean;
          is_active: boolean;
          day_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time_minutes: number;
          energy_key: string;
          label?: string | null;
          notify_on_transition?: boolean;
          is_active?: boolean;
          day_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time_minutes?: number;
          energy_key?: string;
          label?: string | null;
          notify_on_transition?: boolean;
          is_active?: boolean;
          day_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      anchor_presets: {
        Row: {
          id: string;
          user_id: string;
          anchor_type: string;
          preset_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anchor_type: string;
          preset_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anchor_type?: string;
          preset_text?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_internal_weather_stats: {
        Row: {
          user_id: string;
          internal_weather: string;
          occurrence_count: number;
          first_logged: string | null;
          last_logged: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_checkin_with_focus: {
        Args: {
          p_user_id: string;
          p_internal_weather: string;
          p_weather_icon?: string | null;
          p_forecast_note?: string | null;
          p_focus_items?: Json;
          p_checkin_date?: string;
        };
        Returns: string;
      };
      update_user_metadata: {
        Args: {
          p_metadata: Json;
        };
        Returns: Json;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
