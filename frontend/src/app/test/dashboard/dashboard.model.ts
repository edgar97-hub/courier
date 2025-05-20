import { Type } from '@angular/core';

export type Widget = {
  id: number;
  label: string;
  content: Type<unknown>;
  rows?: number;
  columns?: number;
  backgroundColor?: string;
  color?: string;
};

export type UserDashboard = {
  widgets: Widget[];
  order: number[];
};
