export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
    };
    Enums: {};
    CompositeTypes: {};
  };
}
