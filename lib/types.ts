export interface Company {
  id: string
  slug: string
  name: string
  logo_url?: string
  website?: string
  industry?: string
  size?: string
  plan: string
  trial_ends_at?: string
  locale: string
  timezone: string
  settings: Record<string, any>
  created_at: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status?: string
}

export interface User {
  id: string
  company_id: string
  email: string
  name?: string
  role: string
  avatar_url?: string
  created_at: string
}

export interface Job {
  id: string
  company_id: string
  title: Record<string, string>
  description: Record<string, string>
  requirements?: Record<string, string>
  benefits?: Record<string, string>
  location?: string
  remote_type?: string
  employment_type?: string
  department?: string
  salary_min?: number
  salary_max?: number
  salary_currency: string
  status: string
  published_at?: string
  expires_at?: string
  created_at: string
}

export interface Candidate {
  id: string
  email: string
  name: string
  phone?: string
  linkedin_url?: string
  resume_url?: string
  portfolio_url?: string
  location?: string
  data: Record<string, any>
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  company_id: string
  stage: string
  rating?: number
  notes: any[]
  rejected_reason?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: string[]
  limits: {
    jobs: number
    users: number
    applications_per_month: number
  }
  is_popular?: boolean
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
}

export interface TeamMember {
  id: string
  company_id: string
  user_id: string
  email: string
  name?: string
  role: string
  permissions: string[]
  status: string
  invited_at: string
  joined_at?: string
}

export interface Notification {
  id: string
  user_id: string
  company_id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}
