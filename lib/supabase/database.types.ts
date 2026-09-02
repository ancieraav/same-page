export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      questions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_system: boolean
          kind: string
          options: Json
          ordinal: number
          prompt: string
          room_id: string
          skipped_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_system?: boolean
          kind: string
          options?: Json
          ordinal: number
          prompt: string
          room_id: string
          skipped_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_system?: boolean
          kind?: string
          options?: Json
          ordinal?: number
          prompt?: string
          room_id?: string
          skipped_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          answer_text: string | null
          id: string
          member_id: string
          option_id: string | null
          question_id: string
          room_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          id?: string
          member_id: string
          option_id?: string | null
          question_id: string
          room_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          id?: string
          member_id?: string
          option_id?: string | null
          question_id?: string
          room_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "room_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_assets: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          file_name: string
          id: string
          room_id: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by: string
          file_name: string
          id?: string
          room_id: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          file_name?: string
          id?: string
          room_id?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_assets_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          room_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          room_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_member_progress: {
        Row: {
          member_id: string
          question_id: string
          room_id: string
          stage: string
          updated_at: string
        }
        Insert: {
          member_id: string
          question_id: string
          room_id: string
          stage: string
          updated_at?: string
        }
        Update: {
          member_id?: string
          question_id?: string
          room_id?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_member_progress_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "room_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_member_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_member_progress_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          display_name: string
          id: string
          joined_at: string
          last_seen_at: string
          left_at: string | null
          member_type: string
          role_id: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          id?: string
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          member_type?: string
          role_id?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          id?: string
          joined_at?: string
          last_seen_at?: string
          left_at?: string | null
          member_type?: string
          role_id?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "room_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_roles: {
        Row: {
          id: string
          name: string
          position: number
          room_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          room_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_roles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          anonymous_names: boolean
          code: string
          completed_at: string | null
          created_at: string
          current_question_id: string | null
          id: string
          join_token: string | null
          notes: string
          operator_id: string
          participant_limit: number | null
          participant_mode: string
          phase: string
          room_name: string
          separate_access: boolean
          share_responses: boolean
          started_at: string | null
          status: string
          topic: string
          use_memes: boolean
          use_roles: boolean
          version: number
        }
        Insert: {
          anonymous_names?: boolean
          code: string
          completed_at?: string | null
          created_at?: string
          current_question_id?: string | null
          id?: string
          join_token?: string | null
          notes?: string
          operator_id: string
          participant_limit?: number | null
          participant_mode: string
          phase?: string
          room_name: string
          separate_access?: boolean
          share_responses?: boolean
          started_at?: string | null
          status?: string
          topic: string
          use_memes?: boolean
          use_roles?: boolean
          version?: number
        }
        Update: {
          anonymous_names?: boolean
          code?: string
          completed_at?: string | null
          created_at?: string
          current_question_id?: string | null
          id?: string
          join_token?: string | null
          notes?: string
          operator_id?: string
          participant_limit?: number | null
          participant_mode?: string
          phase?: string
          room_name?: string
          separate_access?: boolean
          share_responses?: boolean
          started_at?: string | null
          status?: string
          topic?: string
          use_memes?: boolean
          use_roles?: boolean
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "rooms_current_question_id_fkey"
            columns: ["current_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acknowledge_compare: {
        Args: { p_question_id: string; p_room_id: string }
        Returns: Json
      }
      acknowledge_meme: {
        Args: { p_question_id: string; p_room_id: string }
        Returns: Json
      }
      add_question: {
        Args: { p_prompt: string; p_room_id: string }
        Returns: Json
      }
      add_room_asset: {
        Args: {
          p_content_type: string
          p_file_name: string
          p_room_id: string
          p_size_bytes: number
          p_storage_path: string
        }
        Returns: {
          content_type: string
          created_at: string
          created_by: string
          file_name: string
          id: string
          room_id: string
          size_bytes: number
          storage_path: string
        }
        SetofOptions: {
          from: "*"
          to: "room_assets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_room: {
        Args: {
          p_anonymous_names?: boolean
          p_notes?: string
          p_participant_limit?: number
          p_participant_mode?: string
          p_roles?: Json
          p_room_name: string
          p_separate_access?: boolean
          p_share_responses?: boolean
          p_topic: string
          p_use_memes?: boolean
          p_use_roles?: boolean
        }
        Returns: Json
      }
      join_room: {
        Args: {
          p_display_name: string
          p_join_token?: string
          p_role_id?: string
          p_room_code: string
        }
        Returns: Json
      }
      leave_room: { Args: { p_room_id: string }; Returns: Json }
      skip_question: { Args: { p_room_id: string }; Returns: Json }
      start_room: {
        Args: { p_operator_id: string; p_room_code: string }
        Returns: Json
      }
      submit_response: {
        Args: {
          p_answer_text?: string
          p_option_id?: string
          p_question_id: string
          p_room_id: string
        }
        Returns: Json
      }
      update_member_role: {
        Args: { p_role_id?: string; p_room_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
