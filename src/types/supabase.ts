export interface Abonnement {
  id: string;
  company_name: string;
  status: string;
  renewal_date: string;
  admin_email: string;
  admin_pin: string;
}

export interface ReservationDabo {
  id: string;
  ticket_id: string;
  departure_city: string;
  arrival_city: string;
  travel_date: string;
  seat_number: string;
  passenger_count: number;
  civility: string | null;
  full_name: string;
  phone: string;
  identity_document_type: string | null;
  identity_document_number: string | null;
  emergency_contact: string | null;
  boarding_point: string | null;
  luggage_count: number;
  payment_method: string;
  created_at: string;
}

export interface LoyaltyProfile {
  id: string;
  phone: string;
  full_name: string | null;
  points_balance: number;
  total_lifetime_points: number;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  phone: string;
  points_change: number;
  type: string;
  description: string | null;
  created_at: string;
}

export interface GiftCard {
  id: string;
  code: string;
  discount_percent: number;
  created_for_phone: string | null;
  is_used: boolean;
  created_at: string;
}

export interface RewardRequest {
  id: string;
  phone: string;
  operator: string;
  reward_type: string;
  status: string;
  created_at: string;
}

export interface ReclamationDabo {
  id: string;
  client_name: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
}

export interface Report {
  id: string;
  company: string;
  route: string;
  message: string;
  new_date: string;
  created_at: string;
}
