import { User } from '../models/user.model';

export interface UserState {
  users: User[];
  isLoading: boolean;
  isSubmitting: boolean; // Para operaciones CUD (Create, Update, Delete)
  error: string | null;
}

export const initialUserState: UserState = {
  users: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};
