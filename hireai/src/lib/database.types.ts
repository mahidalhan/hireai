export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string
          created_at: string
          name: string
          title: string
          company: string
          location: string
          skills: string[]
          experience: string
          education: string
          linkedin_url: string
          search_id: string
          profile_data: Json
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          title?: string
          company?: string
          location?: string
          skills?: string[]
          experience?: string
          education?: string
          linkedin_url: string
          search_id: string
          profile_data?: Json
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          title?: string
          company?: string
          location?: string
          skills?: string[]
          experience?: string
          education?: string
          linkedin_url?: string
          search_id?: string
          profile_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "candidates_search_id_fkey"
            columns: ["search_id"]
            referencedRelation: "searches"
            referencedColumns: ["id"]
          }
        ]
      }
      searches: {
        Row: {
          id: string
          created_at: string
          query: string
          filters: Json
          results_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          query: string
          filters?: Json
          results_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          query?: string
          filters?: Json
          results_count?: number
        }
        Relationships: []
      }
      saved_candidates: {
        Row: {
          id: string
          created_at: string
          candidate_id: string
          notes: string
        }
        Insert: {
          id?: string
          created_at?: string
          candidate_id: string
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          candidate_id?: string
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
