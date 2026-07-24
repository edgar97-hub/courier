import {
  EnvironmentProviders,
  importProvidersFrom,
  Provider,
} from '@angular/core';
import { provideState, } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { userReducer } from './store/user.reducer';
import { UserEffects } from './store/user.effects';

export const usersFeatureProviders: Array<Provider | EnvironmentProviders> = [
  provideState({ name: 'users', reducer: userReducer }),
  provideEffects(UserEffects),
];
