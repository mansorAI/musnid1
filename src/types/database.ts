export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EmployeeActionType =
  | "clock_in" | "clock_out"
  | "invoice_created" | "invoice_deleted"
  | "product_added" | "product_updated" | "product_deleted";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          preferred_language: string | null;
          role: "admin" | "business" | "customer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          preferred_language?: string | null;
          role?: "admin" | "business" | "customer";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          type: Database["public"]["Enums"]["business_type"];
          description: string | null;
          city: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          contact_phone: string | null;
          contact_email: string | null;
          working_hours: Json;
          bot_settings: Json;
          whatsapp_number: string | null;
          twilio_sender_id: string | null;
          twilio_subaccount_sid: string | null;
          whatsapp_status: string | null;
          subscription_tier: Database["public"]["Enums"]["subscription_tier"];
          subscription_status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          subscription_started_at: string | null;
          subscription_ends_at: string | null;
          current_period_messages: number;
          current_period_start: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          type: Database["public"]["Enums"]["business_type"];
          description?: string | null;
          city?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          working_hours?: Json;
          bot_settings?: Json;
          whatsapp_number?: string | null;
          twilio_sender_id?: string | null;
          twilio_subaccount_sid?: string | null;
          whatsapp_status?: string | null;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
          subscription_status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          subscription_started_at?: string | null;
          subscription_ends_at?: string | null;
          current_period_messages?: number;
          current_period_start?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_categories"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "menu_categories_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_items: {
        Row: {
          id: string;
          business_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          display_order: number;
          preparation_time_minutes: number | null;
          calories: number | null;
          is_spicy: boolean;
          is_vegetarian: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          display_order?: number;
          preparation_time_minutes?: number | null;
          calories?: number | null;
          is_spicy?: boolean;
          is_vegetarian?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "menu_items_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_members: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          title: string | null;
          specialty: string | null;
          bio: string | null;
          photo_url: string | null;
          working_hours: Json | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          title?: string | null;
          specialty?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          working_hours?: Json | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "staff_members_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          staff_id: string | null;
          name: string;
          description: string | null;
          price: number | null;
          price_max: number | null;
          duration_minutes: number;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          staff_id?: string | null;
          name: string;
          description?: string | null;
          price?: number | null;
          price_max?: number | null;
          duration_minutes?: number;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["id"];
          },
        ];
      };
      business_offers: {
        Row: { id: string; business_id: string; title: string; product_id: string | null; is_visible: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; title: string; product_id?: string | null; is_visible?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["business_offers"]["Insert"]>;
        Relationships: [{ foreignKeyName: "business_offers_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] }];
      };
      store_categories: {
        Row: { id: string; name: string; icon: string; action_type: "order" | "booking" | "inquiry"; supports_bot: boolean; sort_order: number; is_active: boolean; section_key: string; product_display_config: Json | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; icon?: string; action_type?: "order" | "booking" | "inquiry"; supports_bot?: boolean; sort_order?: number; is_active?: boolean; section_key?: string; product_display_config?: Json | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["store_categories"]["Insert"]>;
        Relationships: [];
      };
      zone_sections: {
        Row: { id: string; name: string; section_key: string; sort_order: number; is_active: boolean; product_display_config: Json | null; bg_color_start: string | null; bg_color_end: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; section_key: string; sort_order?: number; is_active?: boolean; product_display_config?: Json | null; bg_color_start?: string | null; bg_color_end?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["zone_sections"]["Insert"]>;
        Relationships: [];
      };
      ad_banners: {
        Row: { id: string; title: string; subtitle: string | null; image_url: string | null; bg_color: string; section_key: string; is_active: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; subtitle?: string | null; image_url?: string | null; bg_color?: string; section_key?: string; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["ad_banners"]["Insert"]>;
        Relationships: [];
      };
      calendar_overrides: {
        Row: {
          id: string;
          business_id: string;
          date: string;
          is_closed: boolean;
          open_time: string | null;
          close_time: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          date: string;
          is_closed?: boolean;
          open_time?: string | null;
          close_time?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_overrides"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "calendar_overrides_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          phone: string;
          name: string | null;
          first_seen_at: string;
          last_message_at: string | null;
          total_messages: number;
          preferences: Json;
          tags: string[];
        };
        Insert: {
          id?: string;
          business_id: string;
          phone: string;
          name?: string | null;
          first_seen_at?: string;
          last_message_at?: string | null;
          total_messages?: number;
          preferences?: Json;
          tags?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          service_id: string | null;
          staff_id: string | null;
          scheduled_at: string;
          duration_minutes: number;
          status: string;
          notes: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          service_id?: string | null;
          staff_id?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          status?: string;
          notes?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff_members";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          status: string;
          window_expires_at: string | null;
          started_at: string;
          last_message_at: string;
          closed_at: string | null;
          summary: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          status?: string;
          window_expires_at?: string | null;
          started_at?: string;
          last_message_at?: string;
          closed_at?: string | null;
          summary?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          direction: string;
          content_type: string;
          content: Json;
          twilio_message_sid: string | null;
          ai_metadata: Json | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          direction: string;
          content_type?: string;
          content: Json;
          twilio_message_sid?: string | null;
          ai_metadata?: Json | null;
          status?: string | null;
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
      consents: {
        Row: {
          id: string;
          business_id: string;
          customer_phone: string;
          consent_type: Database["public"]["Enums"]["consent_type"];
          status: Database["public"]["Enums"]["consent_status"];
          consent_text: string | null;
          consent_method: string | null;
          source_message_id: string | null;
          opted_in_at: string | null;
          opted_out_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_phone: string;
          consent_type: Database["public"]["Enums"]["consent_type"];
          status?: Database["public"]["Enums"]["consent_status"];
          consent_text?: string | null;
          consent_method?: string | null;
          source_message_id?: string | null;
          opted_in_at?: string | null;
          opted_out_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["consents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "consents_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consents_source_message_id_fkey";
            columns: ["source_message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
        ];
      };
      message_templates: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          display_name: string | null;
          category: Database["public"]["Enums"]["template_category"];
          language: string | null;
          content: string;
          variables: Json;
          status: Database["public"]["Enums"]["template_status"];
          twilio_template_sid: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          display_name?: string | null;
          category: Database["public"]["Enums"]["template_category"];
          language?: string | null;
          content: string;
          variables?: Json;
          status?: Database["public"]["Enums"]["template_status"];
          twilio_template_sid?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["message_templates"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "message_templates_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      personal_tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          context_tag: Database["public"]["Enums"]["task_context_tag"];
          base_weight: number;
          energy_required: number;
          days_delayed: number;
          status: "active" | "done" | "archived";
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          context_tag?: Database["public"]["Enums"]["task_context_tag"];
          base_weight?: number;
          energy_required?: number;
          days_delayed?: number;
          status?: "active" | "done" | "archived";
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["personal_tasks"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "personal_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_time_windows: {
        Row: {
          id: string;
          task_id: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_time_windows"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "task_time_windows_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "personal_tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      user_energy_map: {
        Row: {
          id: string;
          user_id: string;
          hour: number;
          energy_level: number;
          sample_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hour: number;
          energy_level?: number;
          sample_count?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_energy_map"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "user_energy_map_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_surface_log: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          context_tag: Database["public"]["Enums"]["task_context_tag"];
          surface_score: number | null;
          outcome: "done" | "snoozed" | "ignored";
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          context_tag: Database["public"]["Enums"]["task_context_tag"];
          surface_score?: number | null;
          outcome: "done" | "snoozed" | "ignored";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_surface_log"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "task_surface_log_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "personal_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_surface_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_suppression_factors: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          context_tag: Database["public"]["Enums"]["task_context_tag"];
          factor: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          context_tag: Database["public"]["Enums"]["task_context_tag"];
          factor?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_suppression_factors"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "task_suppression_factors_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "personal_tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_suppression_factors_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invoice_settings: {
        Row: {
          business_id: string;
          seller_name: string;
          vat_number: string | null;
          seller_address: string | null;
          vat_registered: boolean;
          vat_mode: Database["public"]["Enums"]["invoice_vat_mode"];
          vat_rate: number;
          invoice_prefix: string;
          next_invoice_number: number;
          zatca_environment: Database["public"]["Enums"]["zatca_environment"];
          phase2_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          business_id: string;
          seller_name?: string;
          vat_number?: string | null;
          seller_address?: string | null;
          vat_registered?: boolean;
          vat_mode?: Database["public"]["Enums"]["invoice_vat_mode"];
          vat_rate?: number;
          invoice_prefix?: string;
          next_invoice_number?: number;
          zatca_environment?: Database["public"]["Enums"]["zatca_environment"];
          phase2_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_settings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "invoice_settings_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: true;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          created_by: string | null;
          invoice_number: string;
          invoice_kind: Database["public"]["Enums"]["invoice_kind"];
          status: Database["public"]["Enums"]["invoice_status"];
          payment_method: Database["public"]["Enums"]["invoice_payment_method"];
          seller_name: string;
          seller_vat_number: string | null;
          seller_address: string | null;
          buyer_name: string | null;
          buyer_vat_number: string | null;
          buyer_phone: string | null;
          currency: string;
          vat_mode: Database["public"]["Enums"]["invoice_vat_mode"];
          vat_rate: number;
          subtotal_amount: number;
          discount_amount: number;
          taxable_amount: number;
          vat_amount: number;
          total_amount: number;
          qr_tlv: string | null;
          xml_hash: string | null;
          xml_uuid: string | null;
          icv: number | null;
          previous_invoice_hash: string | null;
          zatca_payload: Json;
          zatca_response: Json;
          issued_at: string;
          reported_at: string | null;
          cleared_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string | null;
          created_by?: string | null;
          invoice_number: string;
          invoice_kind?: Database["public"]["Enums"]["invoice_kind"];
          status?: Database["public"]["Enums"]["invoice_status"];
          payment_method?: Database["public"]["Enums"]["invoice_payment_method"];
          seller_name: string;
          seller_vat_number?: string | null;
          seller_address?: string | null;
          buyer_name?: string | null;
          buyer_vat_number?: string | null;
          buyer_phone?: string | null;
          currency?: string;
          vat_mode?: Database["public"]["Enums"]["invoice_vat_mode"];
          vat_rate?: number;
          subtotal_amount?: number;
          discount_amount?: number;
          taxable_amount?: number;
          vat_amount?: number;
          total_amount?: number;
          qr_tlv?: string | null;
          xml_hash?: string | null;
          xml_uuid?: string | null;
          icv?: number | null;
          previous_invoice_hash?: string | null;
          zatca_payload?: Json;
          zatca_response?: Json;
          issued_at?: string;
          reported_at?: string | null;
          cleared_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          business_id: string;
          name: string;
          description: string | null;
          qty: number;
          unit_price: number;
          discount_amount: number;
          taxable_amount: number;
          vat_amount: number;
          total_amount: number;
          vat_category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          business_id: string;
          name: string;
          description?: string | null;
          qty?: number;
          unit_price?: number;
          discount_amount?: number;
          taxable_amount?: number;
          vat_amount?: number;
          total_amount?: number;
          vat_category?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_items_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      sales_products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          price: number;
          vat_inclusive: boolean;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          price: number;
          vat_inclusive?: boolean;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales_products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "sales_products_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      zatca_devices: {
        Row: {
          id: string;
          business_id: string;
          device_name: string;
          environment: Database["public"]["Enums"]["zatca_environment"];
          compliance_csid: string | null;
          production_csid: string | null;
          private_key_ref: string | null;
          certificate_info: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["zatca_devices"]["Row"]> & {
          business_id: string;
          device_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["zatca_devices"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "zatca_devices_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      zatca_submissions: {
        Row: {
          id: string;
          invoice_id: string;
          business_id: string;
          environment: Database["public"]["Enums"]["zatca_environment"];
          request_payload: Json;
          response_payload: Json;
          status: string;
          error_message: string | null;
          submitted_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["zatca_submissions"]["Row"]> & {
          invoice_id: string;
          business_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["zatca_submissions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "zatca_submissions_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "zatca_submissions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      // ── Platform foundation ────────────────────────────────────────────────
      plans: {
        Row: { id: string; name: string; description: string | null; price: number; currency: string; billing_interval: string; is_active: boolean; is_featured: boolean; sort_order: number; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; description?: string | null; price?: number; currency?: string; billing_interval?: string; is_active?: boolean; is_featured?: boolean; sort_order?: number; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      plan_features: {
        Row: { id: string; plan_id: string; feature_key: string; feature_limit: number | null; created_at: string };
        Insert: { id?: string; plan_id: string; feature_key: string; feature_limit?: number | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["plan_features"]["Insert"]>;
        Relationships: [{ foreignKeyName: "plan_features_plan_id_fkey"; columns: ["plan_id"]; isOneToOne: false; referencedRelation: "plans"; referencedColumns: ["id"] }];
      };
      business_subscriptions: {
        Row: { id: string; business_id: string; plan_id: string; status: "trial" | "active" | "expired" | "cancelled"; started_at: string; expires_at: string | null; trial_ends_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; plan_id: string; status?: "trial" | "active" | "expired" | "cancelled"; started_at?: string; expires_at?: string | null; trial_ends_at?: string | null; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["business_subscriptions"]["Insert"]>;
        Relationships: [{ foreignKeyName: "bs_business_id_fkey"; columns: ["business_id"]; isOneToOne: true; referencedRelation: "businesses"; referencedColumns: ["id"] }, { foreignKeyName: "bs_plan_id_fkey"; columns: ["plan_id"]; isOneToOne: false; referencedRelation: "plans"; referencedColumns: ["id"] }];
      };
      // ── نظام الموظفين المرتبط بحسابات التطبيق ──────────────────────────────
      business_employees: {
        Row: { id: string; business_id: string; profile_id: string; invited_by: string | null; role_type: "staff" | "cashier"; status: "active" | "suspended" | "removed"; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; profile_id: string; invited_by?: string | null; role_type?: "staff" | "cashier"; status?: "active" | "suspended" | "removed"; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["business_employees"]["Insert"]>;
        Relationships: [];
      };
      employee_permissions: {
        Row: { id: string; business_id: string; employee_id: string; cashier_access: boolean; can_read: boolean; can_create: boolean; can_update: boolean; can_delete: boolean; can_manage_products: boolean; can_product_settings: boolean; can_manage_orders: boolean; can_invoice: boolean; can_sales: boolean; can_manage_offers: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; employee_id: string; cashier_access?: boolean; can_read?: boolean; can_create?: boolean; can_update?: boolean; can_delete?: boolean; can_manage_products?: boolean; can_product_settings?: boolean; can_manage_orders?: boolean; can_invoice?: boolean; can_sales?: boolean; can_manage_offers?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["employee_permissions"]["Insert"]>;
        Relationships: [];
      };
      employee_sessions: {
        Row: { id: string; business_id: string; employee_id: string; profile_id: string; clocked_in_at: string; clocked_out_at: string | null; created_at: string };
        Insert: { id?: string; business_id: string; employee_id: string; profile_id: string; clocked_in_at?: string; clocked_out_at?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["employee_sessions"]["Insert"]>;
        Relationships: [];
      };
      employee_audit_log: {
        Row: { id: string; business_id: string; employee_id: string; profile_id: string; action_type: EmployeeActionType; entity_type: string | null; entity_id: string | null; description: string | null; metadata: Json; created_at: string };
        Insert: { id?: string; business_id: string; employee_id: string; profile_id: string; action_type: EmployeeActionType; entity_type?: string | null; entity_id?: string | null; description?: string | null; metadata?: Json; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["employee_audit_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_owns_business: {
        Args: { business_uuid: string };
        Returns: boolean;
      };
      user_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
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
      consent_type: "reminders" | "marketing" | "arar_offers";
      consent_status: "opted_in" | "opted_out" | "pending";
      template_category: "utility" | "marketing" | "authentication";
      template_status: "draft" | "pending" | "approved" | "rejected" | "paused";
      task_context_tag: "general" | "calls" | "shopping" | "mail" | "errands";
      invoice_vat_mode: "none" | "inclusive" | "exclusive";
      invoice_kind: "simplified_tax_invoice" | "tax_invoice" | "credit_note" | "debit_note";
      invoice_status: "draft" | "issued" | "reported" | "cleared" | "rejected" | "cancelled";
      invoice_payment_method: "cash" | "card" | "bank_transfer" | "other";
      zatca_environment: "sandbox" | "simulation" | "production";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PersonalTaskRow = Database["public"]["Tables"]["personal_tasks"]["Row"];
export type TaskTimeWindowRow = Database["public"]["Tables"]["task_time_windows"]["Row"];
export type UserEnergyMapRow = Database["public"]["Tables"]["user_energy_map"]["Row"];
export type TaskSurfaceLogRow = Database["public"]["Tables"]["task_surface_log"]["Row"];
export type TaskSuppressionFactorRow = Database["public"]["Tables"]["task_suppression_factors"]["Row"];
export type TaskContextTag = Database["public"]["Enums"]["task_context_tag"];
export type InvoiceSettingsRow = Database["public"]["Tables"]["invoice_settings"]["Row"];
export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"];
export type UserRole = "admin" | "business" | "customer";
export type BusinessOffer  = Database["public"]["Tables"]["business_offers"]["Row"];
export type StoreCategory  = Database["public"]["Tables"]["store_categories"]["Row"];
export type ZoneSection    = Database["public"]["Tables"]["zone_sections"]["Row"];
export type AdBanner       = Database["public"]["Tables"]["ad_banners"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type PlanFeature = Database["public"]["Tables"]["plan_features"]["Row"];
export type BusinessSubscription = Database["public"]["Tables"]["business_subscriptions"]["Row"];
export type BusinessEmployee    = Database["public"]["Tables"]["business_employees"]["Row"];
export type EmployeePermissions = Database["public"]["Tables"]["employee_permissions"]["Row"];
export type EmployeeSession     = Database["public"]["Tables"]["employee_sessions"]["Row"];
export type EmployeeAuditLog    = Database["public"]["Tables"]["employee_audit_log"]["Row"];
