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
      attempts: {
        Row: {
          accuracy: number
          answers: Json
          correct: number
          end_time: string | null
          id: string
          marked_for_review: Json
          score: number | null
          sheet_id: string
          sheet_title: string
          start_time: string
          status: string
          time_spent: number
          unattempted: number
          user_id: string
          wrong: number
        }
        Insert: {
          accuracy?: number
          answers?: Json
          correct?: number
          end_time?: string | null
          id?: string
          marked_for_review?: Json
          score?: number | null
          sheet_id: string
          sheet_title: string
          start_time?: string
          status?: string
          time_spent?: number
          unattempted?: number
          user_id: string
          wrong?: number
        }
        Update: {
          accuracy?: number
          answers?: Json
          correct?: number
          end_time?: string | null
          id?: string
          marked_for_review?: Json
          score?: number | null
          sheet_id?: string
          sheet_title?: string
          start_time?: string
          status?: string
          time_spent?: number
          unattempted?: number
          user_id?: string
          wrong?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempts_sheet_id_fkey"
            columns: ["sheet_id"]
            isOneToOne: false
            referencedRelation: "sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification: {
        Row: {
          badges: Json
          id: string
          last_active_date: string | null
          level: number
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          badges?: Json
          id: string
          last_active_date?: string | null
          level?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          badges?: Json
          id?: string
          last_active_date?: string | null
          level?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      group_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          group_id: string
          id: string
          mime_type: string | null
          size_bytes: number
          uploaded_by: string
          uploader_name: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          group_id: string
          id?: string
          mime_type?: string | null
          size_bytes?: number
          uploaded_by: string
          uploader_name?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          group_id?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number
          uploaded_by?: string
          uploader_name?: string
        }
        Relationships: []
      }
      group_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          group_id: string
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          group_id: string
          id?: string
          token?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          group_id?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          user_id: string
          user_name?: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          group_id: string
          id: string
          text: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          text: string
          user_id: string
          user_name?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          text?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          school: string | null
          study_hours_goal: number | null
          target_exam: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          school?: string | null
          study_hours_goal?: number | null
          target_exam?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          school?: string | null
          study_hours_goal?: number | null
          target_exam?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          accuracy: number
          attempt_id: string
          completed_at: string
          correct: number
          id: string
          max_score: number
          question_results: Json
          score: number
          sheet_id: string
          sheet_title: string
          time_spent: number
          total_questions: number
          unattempted: number
          user_id: string
          wrong: number
        }
        Insert: {
          accuracy?: number
          attempt_id: string
          completed_at?: string
          correct?: number
          id?: string
          max_score?: number
          question_results?: Json
          score?: number
          sheet_id: string
          sheet_title: string
          time_spent?: number
          total_questions: number
          unattempted?: number
          user_id: string
          wrong?: number
        }
        Update: {
          accuracy?: number
          attempt_id?: string
          completed_at?: string
          correct?: number
          id?: string
          max_score?: number
          question_results?: Json
          score?: number
          sheet_id?: string
          sheet_title?: string
          time_spent?: number
          total_questions?: number
          unattempted?: number
          user_id?: string
          wrong?: number
        }
        Relationships: [
          {
            foreignKeyName: "results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_sheet_id_fkey"
            columns: ["sheet_id"]
            isOneToOne: false
            referencedRelation: "sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      sheets: {
        Row: {
          answer_key: Json | null
          created_at: string
          id: string
          marks_per_question: number
          negative_marking: number
          options_per_question: number
          subject: string
          time_limit: number
          title: string
          total_questions: number
          user_id: string
        }
        Insert: {
          answer_key?: Json | null
          created_at?: string
          id?: string
          marks_per_question?: number
          negative_marking?: number
          options_per_question?: number
          subject?: string
          time_limit?: number
          title: string
          total_questions: number
          user_id: string
        }
        Update: {
          answer_key?: Json | null
          created_at?: string
          id?: string
          marks_per_question?: number
          negative_marking?: number
          options_per_question?: number
          subject?: string
          time_limit?: number
          title?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_group_by_invite: {
        Args: { _token: string }
        Returns: {
          group_id: string
          group_name: string
        }[]
      }
      get_group_member_profiles: {
        Args: { _ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
        }[]
      }
      group_member_count: { Args: { _group_id: string }; Returns: number }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      join_group_via_invite: {
        Args: { _token: string; _user_name: string }
        Returns: string
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
