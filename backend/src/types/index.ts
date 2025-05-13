export type ProfileType = 'talent' | 'hr' | 'manager';

export interface User {
    id: number;
    email: string;
    profile_type: ProfileType;
    created_at: Date;
}

export interface TalentProfile {
    id: number;
    user_id: number;
    full_name: string;
    interest_area: string;
    portfolio_link?: string;
    avatar_url?: string;
    created_at: Date;
}

export interface HRProfile {
    id: number;
    user_id: number;
    full_name: string;
    company: string;
    cnpj: string;
    avatar_url?: string;
    created_at: Date;
}

export interface ManagerProfile {
    id: number;
    user_id: number;
    full_name: string;
    company: string;
    position: string;
    talent_search_area: string;
    avatar_url?: string;
    created_at: Date;
} 