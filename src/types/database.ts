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
      organizations: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          business_type: Database["public"]["Enums"]["business_type"];
          whatsapp_number: string | null;
          city: string | null;
          subscription_tier: Database["public"]["Enums"]["subscription_tier"];
          subscription_status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          business_type?: Database["public"]["Enums"]["business_type"];
          whatsapp_number?: string | null;
          city?: string | null;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
          subscription_status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          phone: string;
          tags: string[];
          last_seen_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          phone: string;
          tags?: string[];
          last_seen_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          channel: Database["public"]["Enums"]["channel"];
          status: Database["public"]["Enums"]["conversation_status"];
          summary: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_id: string;
          channel?: Database["public"]["Enums"]["channel"];
          status?: Database["public"]["Enums"]["conversation_status"];
          summary?: string | null;
          last_message_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          direction: "inbound" | "outbound";
          body: string;
          ai_generated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          direction: "inbound" | "outbound";
          body: string;
          ai_generated?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_articles: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          content: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          content: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["knowledge_articles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      automations: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          trigger: string;
          response: string;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          trigger: string;
          response: string;
          enabled?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["automations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "automations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      business_type:
        | "restaurant"
        | "cafe"
        | "clinic"
        | "salon"
        | "retail"
        | "real_estate"
        | "services"
        | "other";
      subscription_tier: "starter" | "growth" | "business";
      subscription_status: "trial" | "active" | "suspended" | "cancelled";
      conversation_status: "open" | "pending" | "resolved";
      channel: "whatsapp" | "web";
    };
    CompositeTypes: Record<string, never>;
  };
};
