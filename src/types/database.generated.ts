// 临时数据库类型，与初始迁移保持一致。
// Docker/Supabase本地环境可用后，运行 `pnpm db:types` 由CLI覆盖本文件。

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
      rate_limits: {
        Row: {
          action: string;
          expires_at: string;
          key_hash: string;
          request_count: number;
          window_started_at: string;
        };
        Insert: {
          action: string;
          expires_at: string;
          key_hash: string;
          request_count?: number;
          window_started_at: string;
        };
        Update: {
          action?: string;
          expires_at?: string;
          key_hash?: string;
          request_count?: number;
          window_started_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          address: string;
          categories: string[];
          contact_email: string | null;
          created_at: string;
          description: string | null;
          email_verified_at: string | null;
          end_at: string;
          id: string;
          location: unknown;
          manage_token: string | null;
          photos: string[];
          postcode: string;
          source: string;
          source_url: string | null;
          start_at: string;
          state: string;
          status: string;
          suburb: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          categories?: string[];
          contact_email?: string | null;
          created_at?: string;
          description?: string | null;
          email_verified_at?: string | null;
          end_at: string;
          id?: string;
          location: unknown;
          manage_token?: string | null;
          photos?: string[];
          postcode: string;
          source?: string;
          source_url?: string | null;
          start_at: string;
          state: string;
          status?: string;
          suburb: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          categories?: string[];
          contact_email?: string | null;
          created_at?: string;
          description?: string | null;
          email_verified_at?: string | null;
          end_at?: string;
          id?: string;
          location?: unknown;
          manage_token?: string | null;
          photos?: string[];
          postcode?: string;
          source?: string;
          source_url?: string | null;
          start_at?: string;
          state?: string;
          status?: string;
          suburb?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      suburbs: {
        Row: {
          created_at: string;
          id: number;
          location: unknown;
          name: string;
          postcode: string;
          slug: string;
          state: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          location: unknown;
          name: string;
          postcode: string;
          slug: string;
          state: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          location?: unknown;
          name?: string;
          postcode?: string;
          slug?: string;
          state?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_sales: {
        Row: {
          address: string | null;
          categories: string[] | null;
          created_at: string | null;
          description: string | null;
          end_at: string | null;
          id: string | null;
          latitude: number | null;
          longitude: number | null;
          photos: string[] | null;
          postcode: string | null;
          source: string | null;
          source_url: string | null;
          start_at: string | null;
          state: string | null;
          suburb: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      all_https_urls: { Args: { urls: string[] }; Returns: boolean };
      consume_rate_limit: {
        Args: {
          limit_action: string;
          limit_key_hash: string;
          max_requests: number;
          window_seconds: number;
        };
        Returns: boolean;
      };
      delete_expired_rate_limits: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_upcoming_sales_near: {
        Args: {
          category_filters?: string[] | null;
          radius_km?: number;
          search_latitude: number;
          search_longitude: number;
          window_end?: string;
        };
        Returns: {
          address: string;
          categories: string[];
          description: string | null;
          distance_km: number;
          end_at: string;
          id: string;
          latitude: number;
          longitude: number;
          photos: string[];
          postcode: string;
          source: string;
          source_url: string | null;
          start_at: string;
          state: string;
          suburb: string;
          title: string;
        }[];
      };
      sale_timezone: { Args: { sale_state: string }; Returns: string };
    };
    Enums: Record<PropertyKey, never>;
    CompositeTypes: Record<PropertyKey, never>;
  };
};
