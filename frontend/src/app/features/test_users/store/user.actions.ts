import { createAction, props } from '@ngrx/store';
import { User } from '../models/user.model';

export const loadUsers = createAction('[User Page/API] Load Users');
export const loadUsersSuccess = createAction(
  '[User API] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersFailure = createAction(
  '[User API] Load Users Failure',
  props<{ error: string }>()
);
export const createUser = createAction(
  '[User Create Page] Create User',
  props<{ user: Omit<User, 'id'> }>() // El backend/servicio asignará el ID
);
export const createUserSuccess = createAction(
  '[User API] Create User Success',
  props<{ user: User }>() // La API devuelve el usuario creado con su ID
);
export const createUserFailure = createAction(
  '[User API] Create User Failure',
  props<{ error: string }>()
);

export const deleteUser = createAction(
  '[User Page] Delete User', // Origen de la acción
  props<{ userId: string }>()
);

export const deleteUserSuccess = createAction(
  '[User API] Delete User Success', // Normalmente el API es el origen del éxito/fallo
  props<{ userId: string }>() // Pasas el ID para que el reducer sepa cuál quitar
);

export const deleteUserFailure = createAction(
  '[User API] Delete User Failure',
  props<{ error: string }>()
);
// ... (clearUserError si la tienes)
export const clearUserError = createAction('[User Store] Clear User Error');
