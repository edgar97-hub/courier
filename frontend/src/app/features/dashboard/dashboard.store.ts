import { ApplicationRef, computed, inject } from '@angular/core';

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

import { rxMethod } from '@ngrx/signals/rxjs-interop';

import {
  addEntities,
  addEntity,
  removeEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { widgetsDirectory } from './widgets-directory';
import { pipe, skip, switchMap } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { Widget } from './dashboard.model';
import { startViewTransition } from '../../shared/utils/view-transitions';

type DashboardState = {
  order: number[];
  settings: {
    mode: 'view' | 'edit';
  };
};

const initialState: DashboardState = {
  order: [],
  settings: { mode: 'view' },
};

export const DashboardStore = signalStore(
  withState(initialState),
  withEntities<Widget>(),
  withComputed(({ entities, order, entityMap }) => ({
    widgetsToAdd: computed(() => {
      const addedIds = entities().map((w) => w.id);
      return widgetsDirectory.filter((w) => !addedIds.includes(w.id));
    }),
    addedWidgets: computed(() => {
      return order().map((w) => ({ ...entityMap()[w] }));
    }),
  })),
  withMethods(
    (
      store,
      dataService = inject(DashboardService),
      appRef = inject(ApplicationRef)
    ) => ({
      async fetchWidgets() {
        const { widgets, order } = await dataService.fetchWidgets();
        startViewTransition(() => {
          patchState(store, addEntities(widgets), { order });
        });
      },
      addWidgetAtPosition(sourceWidgetId: number, destWidgetId: number) {
        const widgetToAdd = widgetsDirectory.find(
          (w) => w.id === sourceWidgetId
        );

        if (!widgetToAdd) {
          return;
        }

        const indexOfDestWidget = store.order().indexOf(destWidgetId);

        const positionToAdd =
          indexOfDestWidget === -1 ? store.order().length : indexOfDestWidget;
        const order = [...store.order()];
        order.splice(positionToAdd, 0, sourceWidgetId);

        startViewTransition(() => {
          patchState(store, addEntity({ ...widgetToAdd }), { order });
        });
      },
      updateWidget(id: number, data: Partial<Widget>) {
        startViewTransition(() => {
          patchState(store, updateEntity({ id, changes: { ...data } }));
        });
      },
      removeWidget(id: number) {
        startViewTransition(() => {
          patchState(store, removeEntity(id), {
            order: store.order().filter((w) => w !== id),
          });
          appRef.tick();
        });
      },
      updateWidgetPosition(sourceWidgetId: number, targetWidgetId: number) {
        const sourceIndex = store.order().indexOf(sourceWidgetId);

        const order = [...store.order()];
        const removedItem = order.splice(sourceIndex, 1)[0];
        const targetIndex = order.indexOf(targetWidgetId);

        const insertAt =
          sourceIndex === targetIndex ? targetIndex + 1 : targetIndex;

        order.splice(insertAt, 0, removedItem);
        startViewTransition(() => {
          patchState(store, { order });
        });
      },
      setMode(mode: 'view' | 'edit') {
        patchState(store, { settings: { mode } });
      },
      saveWidgets: rxMethod<Widget[]>(
        pipe(
          skip(2),
          switchMap((widgets) => dataService.saveWidgets(widgets))
        )
      ),
      saveOrder: rxMethod<number[]>(
        pipe(
          skip(2),
          switchMap((order) => dataService.saveOrder(order))
        )
      ),
    })
  ),
  withHooks({
    async onInit(store) {
      store.fetchWidgets();
      store.saveWidgets(store.entities);
      store.saveOrder(store.order);
    },
  })
);
