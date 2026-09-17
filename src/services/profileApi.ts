import type { Address, AddressPayload, Profile, ProfileUpdatePayload } from "../types/profile";
import { debugAuthState, getAccessToken as readAccessToken } from "./authStorage";

const API_BASE = "http://127.0.0.1:8000/api/profile";

export function getAccessToken() {
  return readAccessToken();
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error && typeof data.error === "object"
          ? Object.values(data.error).flat().join(" ") || "Request failed"
          : "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function getProfile(): Promise<Profile> {
  debugAuthState("profile-fetch-start");
  const response = await fetch(`${API_BASE}/`, {
    headers: authHeaders(),
  });
  const profile = await parseResponse<Profile>(response);
  debugAuthState("profile-fetch-success", { userId: profile.id, email: profile.email });
  return profile;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
  debugAuthState("profile-save-start");
  const response = await fetch(`${API_BASE}/update/`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const profile = await parseResponse<Profile>(response);
  debugAuthState("profile-save-success", { userId: profile.id, email: profile.email });
  return profile;
}

export async function uploadProfilePhoto(file: File): Promise<Profile> {
  const formData = new FormData();
  formData.append("profile_image", file);

  const response = await fetch(`${API_BASE}/photo/`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  return parseResponse<Profile>(response);
}

export async function getAddresses(): Promise<Address[]> {
  const response = await fetch(`${API_BASE}/addresses/`, {
    headers: authHeaders(),
  });
  return parseResponse<Address[]>(response);
}

export async function addAddress(payload: AddressPayload): Promise<Address> {
  const response = await fetch(`${API_BASE}/addresses/add/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse<Address>(response);
}

export async function updateAddress(id: number, payload: AddressPayload): Promise<Address> {
  const response = await fetch(`${API_BASE}/addresses/${id}/update/`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return parseResponse<Address>(response);
}

export async function deleteAddress(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/addresses/${id}/delete/`, {
    method: "DELETE",
    headers: authHeaders({ "Content-Type": "application/json" }),
  });

  await parseResponse<{ message: string }>(response);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const response = await fetch(`${API_BASE}/addresses/${id}/default/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
  });

  return parseResponse<Address>(response);
}
