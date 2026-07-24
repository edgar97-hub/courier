import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserFeatureState = createFeatureSelector<UserState>('users');

export const selectAllUsers = createSelector(
  selectUserFeatureState,
  (state: UserState) => state.users
);

export const selectUserIsLoading = createSelector(
  selectUserFeatureState,
  (state: UserState) => state.isLoading
);

export const selectUserError = createSelector(
  selectUserFeatureState,
  (state: UserState) => state.error
);

export const selectUserIsSubmitting = createSelector(
  selectUserFeatureState,
  (state: UserState) => state.isSubmitting
);
