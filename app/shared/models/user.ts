export interface UserPrefs {
  avatarFileId?: string;
  avatarFileName?: string;
  theme?: string;
  [key: string]: unknown;
}

export interface User {
  $id?: string;
  name?: string;
  email?: string;
  labels?: string[];
  prefs?: UserPrefs;
  [key: string]: unknown;
}
