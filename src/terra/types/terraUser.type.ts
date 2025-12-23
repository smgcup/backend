export type TerraUser = {
  user_id: string; // UUID
  provider: string; // e.g., "FITBIT"
  last_webhook_update: string; // ISO datetime
  scopes: string; // comma-separated
  reference_id: string; // email or external id
  active: boolean;
  created_at?: string; // ISO datetime - only for the auth  successresponse
};
