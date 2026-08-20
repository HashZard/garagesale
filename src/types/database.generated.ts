export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      email_outbox: {
        Row: {
          attempts: number;
          created_at: string;
          id: string;
          kind: string;
          last_error: string | null;
          next_attempt_at: string;
          payload: Json;
          recipient: string;
          sent_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          attempts?: number;
          created_at?: string;
          id?: string;
          kind: string;
          last_error?: string | null;
          next_attempt_at?: string;
          payload: Json;
          recipient: string;
          sent_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          created_at?: string;
          id?: string;
          kind?: string;
          last_error?: string | null;
          next_attempt_at?: string;
          payload?: Json;
          recipient?: string;
          sent_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moderation_events: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: number;
          metadata: Json;
          sale_id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: number;
          metadata?: Json;
          sale_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          id?: number;
          metadata?: Json;
          sale_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderation_events_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "public_sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderation_events_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
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
      sale_access_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          purpose: string;
          revoked_at: string | null;
          sale_id: string;
          token_hash: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          purpose: string;
          revoked_at?: string | null;
          sale_id: string;
          token_hash: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          purpose?: string;
          revoked_at?: string | null;
          sale_id?: string;
          token_hash?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sale_access_tokens_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "public_sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_access_tokens_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_media: {
        Row: {
          byte_size: number | null;
          created_at: string;
          id: string;
          media_type: string | null;
          sale_id: string;
          sort_order: number;
          status: string;
          storage_key: string | null;
          url: string;
        };
        Insert: {
          byte_size?: number | null;
          created_at?: string;
          id?: string;
          media_type?: string | null;
          sale_id: string;
          sort_order: number;
          status?: string;
          storage_key?: string | null;
          url: string;
        };
        Update: {
          byte_size?: number | null;
          created_at?: string;
          id?: string;
          media_type?: string | null;
          sale_id?: string;
          sort_order?: number;
          status?: string;
          storage_key?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sale_media_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "public_sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_media_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_private_details: {
        Row: {
          contact_email: string;
          created_at: string;
          retain_until: string | null;
          sale_id: string;
          updated_at: string;
        };
        Insert: {
          contact_email: string;
          created_at?: string;
          retain_until?: string | null;
          sale_id: string;
          updated_at?: string;
        };
        Update: {
          contact_email?: string;
          created_at?: string;
          retain_until?: string | null;
          sale_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sale_private_details_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: true;
            referencedRelation: "public_sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_private_details_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: true;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          address: string;
          categories: string[];
          created_at: string;
          description: string | null;
          email_verified_at: string | null;
          end_at: string;
          id: string;
          location: unknown;
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
          created_at?: string;
          description?: string | null;
          email_verified_at?: string | null;
          end_at: string;
          id?: string;
          location: unknown;
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
          created_at?: string;
          description?: string | null;
          email_verified_at?: string | null;
          end_at?: string;
          id?: string;
          location?: unknown;
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
        Insert: {
          address?: string | null;
          categories?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          end_at?: string | null;
          id?: string | null;
          latitude?: never;
          longitude?: never;
          photos?: string[] | null;
          postcode?: string | null;
          source?: string | null;
          source_url?: string | null;
          start_at?: string | null;
          state?: string | null;
          suburb?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          categories?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          end_at?: string | null;
          id?: string | null;
          latitude?: never;
          longitude?: never;
          photos?: string[] | null;
          postcode?: string | null;
          source?: string | null;
          source_url?: string | null;
          start_at?: string | null;
          state?: string | null;
          suburb?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      suburb_directory: {
        Row: {
          id: number | null;
          latitude: number | null;
          longitude: number | null;
          name: string | null;
          postcode: string | null;
          slug: string | null;
          state: string | null;
        };
        Insert: {
          id?: number | null;
          latitude?: never;
          longitude?: never;
          name?: string | null;
          postcode?: string | null;
          slug?: string | null;
          state?: string | null;
        };
        Update: {
          id?: number | null;
          latitude?: never;
          longitude?: never;
          name?: string | null;
          postcode?: string | null;
          slug?: string | null;
          state?: string | null;
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
      create_self_sale: {
        Args: {
          p_address: string;
          p_categories: string[];
          p_contact_email: string;
          p_description: string;
          p_end_at: string;
          p_latitude: number;
          p_longitude: number;
          p_photos: string[];
          p_postcode: string;
          p_start_at: string;
          p_state: string;
          p_suburb: string;
          p_title: string;
        };
        Returns: {
          manage_token: string;
          outbox_id: string;
          sale_id: string;
          verification_token: string;
        }[];
      };
      delete_expired_rate_limits: { Args: never; Returns: number };
      get_indexable_suburbs: {
        Args: { state_filter?: string };
        Returns: {
          id: number;
          latitude: number;
          listing_count: number;
          longitude: number;
          name: string;
          postcode: string;
          slug: string;
          state: string;
        }[];
      };
      get_nearby_suburbs: {
        Args: { origin_suburb_id: number; result_limit?: number };
        Returns: {
          distance_km: number;
          id: number;
          latitude: number;
          longitude: number;
          name: string;
          postcode: string;
          slug: string;
          state: string;
        }[];
      };
      get_upcoming_sales_near: {
        Args: {
          category_filters?: string[];
          radius_km?: number;
          search_latitude: number;
          search_longitude: number;
          window_end?: string;
        };
        Returns: {
          address: string;
          categories: string[];
          description: string;
          distance_km: number;
          end_at: string;
          id: string;
          latitude: number;
          longitude: number;
          photos: string[];
          postcode: string;
          source: string;
          source_url: string;
          start_at: string;
          state: string;
          suburb: string;
          title: string;
        }[];
      };
      issue_sale_recovery_tokens: {
        Args: { p_contact_email: string };
        Returns: {
          manage_token: string;
          outbox_id: string;
          sale_id: string;
          sale_status: string;
          sale_title: string;
          verification_token: string;
        }[];
      };
      resolve_manage_sale_id: { Args: { raw_token: string }; Returns: string };
      sale_timezone: { Args: { sale_state: string }; Returns: string };
      verify_sale_token: { Args: { raw_token: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
