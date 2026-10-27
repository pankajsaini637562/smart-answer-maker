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
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
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
      cbt_admit_cards: {
        Row: {
          created_at: string
          exam_id: string
          generated_by: string | null
          id: string
          reference: string
          revoked: boolean
          snapshot: Json
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          exam_id: string
          generated_by?: string | null
          id?: string
          reference?: string
          revoked?: boolean
          snapshot: Json
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          exam_id?: string
          generated_by?: string | null
          id?: string
          reference?: string
          revoked?: boolean
          snapshot?: Json
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cbt_admit_cards_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_admit_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "cbt_students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cbt_answer_keys: {
        Row: {
          correct: number[]
          exam_id: string
          explanation: string | null
          question_id: string
        }
        Insert: {
          correct?: number[]
          exam_id: string
          explanation?: string | null
          question_id: string
        }
        Update: {
          correct?: number[]
          exam_id?: string
          explanation?: string | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_answer_keys_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_answer_keys_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "cbt_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_assignments: {
        Row: {
          assigned_by: string
          created_at: string
          exam_id: string
          user_id: string
        }
        Insert: {
          assigned_by: string
          created_at?: string
          exam_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          exam_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_assignments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "cbt_students"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cbt_attempts: {
        Row: {
          attempt_no: number
          deadline: string
          exam_id: string
          id: string
          started_at: string
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          attempt_no: number
          deadline: string
          exam_id: string
          id?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          attempt_no?: number
          deadline?: string
          exam_id?: string
          id?: string
          started_at?: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_audit_events: {
        Row: {
          attempt_id: string | null
          created_at: string
          details: Json | null
          event: string
          exam_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          attempt_id?: string | null
          created_at?: string
          details?: Json | null
          event: string
          exam_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          attempt_id?: string | null
          created_at?: string
          details?: Json | null
          event?: string
          exam_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbt_audit_events_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_batches: {
        Row: {
          academic_session: string | null
          created_at: string
          id: string
          institute: string | null
          name: string
        }
        Insert: {
          academic_session?: string | null
          created_at?: string
          id?: string
          institute?: string | null
          name: string
        }
        Update: {
          academic_session?: string | null
          created_at?: string
          id?: string
          institute?: string | null
          name?: string
        }
        Relationships: []
      }
      cbt_exams: {
        Row: {
          allow_revisit: boolean
          assignment_only: boolean
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          eligible_batches: string[]
          eligible_classes: string[]
          eligible_institutes: string[]
          eligible_streams: string[]
          ends_at: string | null
          id: string
          instructions: string | null
          marks_correct: number
          marks_unanswered: number
          marks_wrong: number
          max_attempts: number
          published_at: string | null
          reporting_at: string | null
          result_policy: string
          result_release_at: string | null
          results_released: boolean
          show_answers: boolean
          show_explanations: boolean
          starts_at: string | null
          status: string
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_revisit?: boolean
          assignment_only?: boolean
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          eligible_batches?: string[]
          eligible_classes?: string[]
          eligible_institutes?: string[]
          eligible_streams?: string[]
          ends_at?: string | null
          id?: string
          instructions?: string | null
          marks_correct?: number
          marks_unanswered?: number
          marks_wrong?: number
          max_attempts?: number
          published_at?: string | null
          reporting_at?: string | null
          result_policy?: string
          result_release_at?: string | null
          results_released?: boolean
          show_answers?: boolean
          show_explanations?: boolean
          starts_at?: string | null
          status?: string
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          allow_revisit?: boolean
          assignment_only?: boolean
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          eligible_batches?: string[]
          eligible_classes?: string[]
          eligible_institutes?: string[]
          eligible_streams?: string[]
          ends_at?: string | null
          id?: string
          instructions?: string | null
          marks_correct?: number
          marks_unanswered?: number
          marks_wrong?: number
          max_attempts?: number
          published_at?: string | null
          reporting_at?: string | null
          result_policy?: string
          result_release_at?: string | null
          results_released?: boolean
          show_answers?: boolean
          show_explanations?: boolean
          starts_at?: string | null
          status?: string
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cbt_login_limits: {
        Row: {
          key: string
          requests: number
          window_start: string
        }
        Insert: {
          key: string
          requests?: number
          window_start?: string
        }
        Update: {
          key?: string
          requests?: number
          window_start?: string
        }
        Relationships: []
      }
      cbt_notifications: {
        Row: {
          body: string
          created_at: string
          exam_id: string | null
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          exam_id?: string | null
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          exam_id?: string | null
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_notifications_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_organization: {
        Row: {
          extra_fields: Json
          id: boolean
          logo_url: string | null
          name: string
          qr_enabled: boolean
          show_student_photo: boolean
          tagline: string
        }
        Insert: {
          extra_fields?: Json
          id?: boolean
          logo_url?: string | null
          name?: string
          qr_enabled?: boolean
          show_student_photo?: boolean
          tagline?: string
        }
        Update: {
          extra_fields?: Json
          id?: boolean
          logo_url?: string | null
          name?: string
          qr_enabled?: boolean
          show_student_photo?: boolean
          tagline?: string
        }
        Relationships: []
      }
      cbt_question_bank: {
        Row: {
          correct: number[]
          created_at: string
          explanation: string | null
          id: string
          image_url: string | null
          marks: number | null
          multi: boolean
          negative: number | null
          options: Json
          subject: string
          text: string
          topic: string
        }
        Insert: {
          correct: number[]
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          marks?: number | null
          multi?: boolean
          negative?: number | null
          options: Json
          subject?: string
          text: string
          topic?: string
        }
        Update: {
          correct?: number[]
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          marks?: number | null
          multi?: boolean
          negative?: number | null
          options?: Json
          subject?: string
          text?: string
          topic?: string
        }
        Relationships: []
      }
      cbt_questions: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          image_url: string | null
          marks: number | null
          multi: boolean
          negative: number | null
          options: Json
          position: number
          section_id: string | null
          subject: string | null
          text: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          image_url?: string | null
          marks?: number | null
          multi?: boolean
          negative?: number | null
          options?: Json
          position?: number
          section_id?: string | null
          subject?: string | null
          text?: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          image_url?: string | null
          marks?: number | null
          multi?: boolean
          negative?: number | null
          options?: Json
          position?: number
          section_id?: string | null
          subject?: string | null
          text?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbt_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "cbt_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_responses: {
        Row: {
          attempt_id: string
          marked: boolean
          question_id: string
          selected: number[]
          updated_at: string
        }
        Insert: {
          attempt_id: string
          marked?: boolean
          question_id: string
          selected?: number[]
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          marked?: boolean
          question_id?: string
          selected?: number[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "cbt_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "cbt_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_results: {
        Row: {
          accuracy: number
          attempt_id: string
          attempted: number
          computed_at: string
          correct: number
          exam_id: string
          max_marks: number
          negative_marks: number
          percentage: number
          positive_marks: number
          question_results: Json
          score: number
          total_questions: number
          unanswered: number
          user_id: string
          wrong: number
        }
        Insert: {
          accuracy: number
          attempt_id: string
          attempted: number
          computed_at?: string
          correct: number
          exam_id: string
          max_marks: number
          negative_marks: number
          percentage: number
          positive_marks: number
          question_results?: Json
          score: number
          total_questions: number
          unanswered: number
          user_id: string
          wrong: number
        }
        Update: {
          accuracy?: number
          attempt_id?: string
          attempted?: number
          computed_at?: string
          correct?: number
          exam_id?: string
          max_marks?: number
          negative_marks?: number
          percentage?: number
          positive_marks?: number
          question_results?: Json
          score?: number
          total_questions?: number
          unanswered?: number
          user_id?: string
          wrong?: number
        }
        Relationships: [
          {
            foreignKeyName: "cbt_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "cbt_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_sections: {
        Row: {
          exam_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          exam_id: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          exam_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "cbt_sections_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "cbt_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_students: {
        Row: {
          academic_session: string
          admin_note: string | null
          batch: string
          city: string | null
          class: string
          course: string | null
          created_at: string
          extra_details: Json
          full_name: string
          guardian_name: string | null
          institute: string
          reviewed_at: string | null
          reviewed_by: string | null
          roll_number: string
          school: string | null
          status: string
          stream: string
          user_id: string
        }
        Insert: {
          academic_session: string
          admin_note?: string | null
          batch: string
          city?: string | null
          class: string
          course?: string | null
          created_at?: string
          extra_details?: Json
          full_name: string
          guardian_name?: string | null
          institute: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          roll_number?: string
          school?: string | null
          status?: string
          stream: string
          user_id: string
        }
        Update: {
          academic_session?: string
          admin_note?: string | null
          batch?: string
          city?: string | null
          class?: string
          course?: string | null
          created_at?: string
          extra_details?: Json
          full_name?: string
          guardian_name?: string | null
          institute?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          roll_number?: string
          school?: string | null
          status?: string
          stream?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          position?: number
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      course_chapters: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          amount_inr: number
          course_id: string
          enrolled_at: string
          id: string
          provider_session_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount_inr?: number
          course_id: string
          enrolled_at?: string
          id?: string
          provider_session_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          amount_inr?: number
          course_id?: string
          enrolled_at?: string
          id?: string
          provider_session_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lesson_progress: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons_public"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          chapter_id: string
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_preview: boolean
          linked_sheet_id: string | null
          position: number
          resource_pdf_path: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          chapter_id: string
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_preview?: boolean
          linked_sheet_id?: string | null
          position?: number
          resource_pdf_path?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          chapter_id?: string
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_preview?: boolean
          linked_sheet_id?: string | null
          position?: number
          resource_pdf_path?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "course_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_linked_sheet_id_fkey"
            columns: ["linked_sheet_id"]
            isOneToOne: false
            referencedRelation: "sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          enrollment_count: number
          id: string
          instructor_id: string | null
          instructor_name: string | null
          is_free: boolean
          is_published: boolean
          level: string | null
          price_inr: number
          rating_avg: number
          rating_count: number
          slug: string | null
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          enrollment_count?: number
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_free?: boolean
          is_published?: boolean
          level?: string | null
          price_inr?: number
          rating_avg?: number
          rating_count?: number
          slug?: string | null
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          enrollment_count?: number
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          is_free?: boolean
          is_published?: boolean
          level?: string | null
          price_inr?: number
          rating_avg?: number
          rating_count?: number
          slug?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
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
      materials: {
        Row: {
          class: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          file_path: string
          id: string
          is_free: boolean
          is_published: boolean
          price_inr: number
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          class?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          price_inr?: number
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          class?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string
          id?: string
          is_free?: boolean
          is_published?: boolean
          price_inr?: number
          subject?: string | null
          title?: string
          updated_at?: string
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
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          school: string | null
          study_hours_goal: number | null
          target_exam: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          class?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          school?: string | null
          study_hours_goal?: number | null
          target_exam?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          class?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          school?: string | null
          study_hours_goal?: number | null
          target_exam?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          admin_note: string | null
          amount_inr: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          discount_percent: number
          final_amount_inr: number
          id: string
          material_id: string
          receipt_no: string | null
          referrer_user_id: string | null
          screenshot_path: string | null
          status: string
          updated_at: string
          user_id: string
          utr: string | null
        }
        Insert: {
          admin_note?: string | null
          amount_inr: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          discount_percent?: number
          final_amount_inr: number
          id?: string
          material_id: string
          receipt_no?: string | null
          referrer_user_id?: string | null
          screenshot_path?: string | null
          status?: string
          updated_at?: string
          user_id: string
          utr?: string | null
        }
        Update: {
          admin_note?: string | null
          amount_inr?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          discount_percent?: number
          final_amount_inr?: number
          id?: string
          material_id?: string
          receipt_no?: string | null
          referrer_user_id?: string | null
          screenshot_path?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          utr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_credits: {
        Row: {
          created_at: string
          id: string
          percent: number
          source_purchase_id: string | null
          source_signup_user_id: string | null
          used_purchase_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          percent?: number
          source_purchase_id?: string | null
          source_signup_user_id?: string | null
          used_purchase_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          percent?: number
          source_purchase_id?: string | null
          source_signup_user_id?: string | null
          used_purchase_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_credits_source_purchase_id_fkey"
            columns: ["source_purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_credits_used_purchase_id_fkey"
            columns: ["used_purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      course_lessons_public: {
        Row: {
          chapter_id: string | null
          course_id: string | null
          created_at: string | null
          id: string | null
          is_preview: boolean | null
          position: number | null
          title: string | null
        }
        Insert: {
          chapter_id?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string | null
          is_preview?: boolean | null
          position?: number | null
          title?: string | null
        }
        Update: {
          chapter_id?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string | null
          is_preview?: boolean | null
          position?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "course_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cbt_admin_report: { Args: { _exam: string }; Returns: Json }
      cbt_admin_stats: { Args: never; Returns: Json }
      cbt_finalize: {
        Args: { _attempt: string; _auto: boolean }
        Returns: undefined
      }
      cbt_finalize_expired: { Args: { _uid: string }; Returns: undefined }
      cbt_generate_cards: {
        Args: { _exam: string; _users?: string[] }
        Returns: number
      }
      cbt_get_paper: { Args: { _attempt: string }; Returns: Json }
      cbt_get_result: { Args: { _attempt: string }; Returns: Json }
      cbt_is_eligible: {
        Args: {
          _e: Database["public"]["Tables"]["cbt_exams"]["Row"]
          _uid: string
        }
        Returns: boolean
      }
      cbt_is_released: {
        Args: { _e: Database["public"]["Tables"]["cbt_exams"]["Row"] }
        Returns: boolean
      }
      cbt_list_exams: { Args: never; Returns: Json }
      cbt_login_allow: { Args: { _key: string }; Returns: boolean }
      cbt_notify: {
        Args: {
          _body: string
          _exam?: string
          _title: string
          _users?: string[]
        }
        Returns: number
      }
      cbt_publish: { Args: { _exam: string }; Returns: undefined }
      cbt_read_notification: { Args: { _id: string }; Returns: undefined }
      cbt_register: { Args: { _details: Json }; Returns: Json }
      cbt_require_user: { Args: never; Returns: string }
      cbt_review_student: {
        Args: { _batch?: string; _note: string; _status: string; _user: string }
        Returns: undefined
      }
      cbt_save_response: {
        Args: {
          _attempt: string
          _marked: boolean
          _question: string
          _selected: number[]
        }
        Returns: string
      }
      cbt_server_time: { Args: never; Returns: string }
      cbt_sorted: { Args: { _a: number[] }; Returns: number[] }
      cbt_start_attempt: { Args: { _exam: string }; Returns: string }
      cbt_submit: { Args: { _attempt: string }; Returns: string }
      cbt_verify_card: { Args: { _reference: string }; Returns: Json }
      enroll_free_course: { Args: { _course_id: string }; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
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
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          class: string
          country: string
          display_name: string
          level: number
          streak: number
          updated_at: string
          user_id: string
          xp: number
        }[]
      }
      get_my_referrer_code: { Args: never; Returns: string }
      group_member_count: { Args: { _group_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      is_enrolled: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      join_group_via_invite: {
        Args: { _token: string; _user_name: string }
        Returns: string
      }
      lookup_referrer_by_code: {
        Args: { _code: string }
        Returns: {
          display_name: string
          id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "user"
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
    Enums: {
      app_role: ["admin", "instructor", "user"],
    },
  },
} as const
