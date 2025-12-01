export interface Project {
  id: string;
  name: string;
}

export interface Chat {
  id: string;
  title: string;
}

export interface User {
  full_name: string;
  email: string;
  avatar_url?: string;
}
