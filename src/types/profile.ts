export interface Profile {
  id: number;
  name: string;
  mobile_number: string;
  email: string;
  phone: string;
  profile_image?: string | null;
  is_mobile_verified: boolean;
  is_verified: boolean;
  created_at: string;
}

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export interface Address {
  id: number;
  house_flat: string;
  area: string;
  landmark: string;
  city: string;
  pincode: string;
  delivery_instruction: string;
  leave_at_door: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdatePayload = {
  name: string;
  phone: string;
};

export type AddressPayload = Omit<Address, "id" | "created_at" | "updated_at">;
