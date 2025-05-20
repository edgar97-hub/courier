import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { initialUserState } from './user.state';

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loadUsers, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users: users,
    isLoading: false,
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    users: [], // Limpiar usuarios en caso de error
    isLoading: false,
    error: error,
  })),
  on(UserActions.createUser, (state) => ({
    ...state,
    isSubmitting: true,
    error: null,
  })),
  on(UserActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user], // Añade el nuevo usuario a la lista existente
    isSubmitting: false,
  })),
  on(UserActions.createUserFailure, (state, { error }) => ({
    ...state,
    isSubmitting: false,
    error: error,
  })),

  on(UserActions.clearUserError, (state) => ({
    // Para limpiar el error después de mostrarlo
    ...state,
    error: null,
  })),
  on(UserActions.deleteUser, (state) => ({
    ...state,
    isLoading: true, // Poner isLoading a true cuando se inicia la eliminación
    error: null,
  })),

  on(UserActions.deleteUserSuccess, (state, { userId }) => ({
    ...state,
    users: state.users.filter((user) => user.id !== userId), // Eliminar el usuario de la lista
    isLoading: false,
  })),

  on(UserActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error,
  }))
);
