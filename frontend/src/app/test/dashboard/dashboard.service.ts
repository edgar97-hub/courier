import { inject, Injectable } from '@angular/core';
import { widgetsDirectory } from './widgets-directory';
import { UserDashboard, Widget } from './dashboard.model';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/user';
import { FirebaseService } from '../../shared/services/firebase.service';
// import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly STORAGE_KEY = 'user_dashboard_';
  private readonly DEFAULT_DASHBOARD: any = {
    widgets: [
      { id: 1, label: 'Channel Analytics', rows: 2, columns: 2 },
      { id: 2, label: 'Latest Comments', rows: 2, columns: 2 },
      { id: 3, label: 'Latest Video', rows: 2, columns: 2 },
      {
        id: 6,
        label: 'Views',
        rows: 1,
        columns: 1,
        backgroundColor: '#003f5c',
        color: 'whitesmoke',
      },
      {
        id: 7,
        label: 'Watch Time',
        rows: 1,
        columns: 1,
        backgroundColor: '#003f5c',
        color: 'whitesmoke',
      },
      {
        id: 8,
        label: 'Revenue',
        rows: 1,
        columns: 1,
        backgroundColor: '#003f5c',
        color: 'whitesmoke',
      },
      { id: 9, label: 'Traffic sources', rows: 2, columns: 2 },
      {
        id: 5,
        label: 'Subscribers',
        rows: 1,
        columns: 1,
        backgroundColor: '#003f5c',
        color: 'whitesmoke',
      },
      { id: 10, label: 'Published videos', rows: 2, columns: 2 },
      { id: 11, label: 'Ideas for you', rows: 2, columns: 1 },
    ],
    order: [11, 1, 6, 5, 8, 7, 10, 9, 3, 2],
  };

  authService = inject(AuthService);
  firebaseService = inject(FirebaseService);

  async fetchWidgets(): Promise<UserDashboard> {
    const user = this.authService.user() as User;
    const storedData = localStorage.getItem(this.STORAGE_KEY + user.uid);

    if (!storedData) {
      localStorage.setItem(
        this.STORAGE_KEY + user.uid,
        JSON.stringify(this.DEFAULT_DASHBOARD)
      );

      const defaultDashboard = { ...this.DEFAULT_DASHBOARD } as UserDashboard;
      defaultDashboard.widgets.forEach((widget) => {
        const content = widgetsDirectory.find(
          (w) => w.id === widget.id
        )?.content;
        if (content) {
          widget.content = content;
        }
      });

      return defaultDashboard;
    }

    const userDashboard = JSON.parse(storedData) as UserDashboard;

    userDashboard.widgets.forEach((widget) => {
      const content = widgetsDirectory.find((w) => w.id === widget.id)?.content;
      if (content) {
        widget.content = content;
      }
    });

    return userDashboard;
  }

  // Firestore implementation to fetch widgets from Firestore DB

  // async fetchWidgets(): Promise<UserDashboard> {
  //   const user = this.authService.user() as User;
  //   const dashboardRef = doc(this.firebaseService.db, 'dashboards', user.uid);
  //   const dashboardDoc = await getDoc(dashboardRef);

  //   if (!dashboardDoc.exists()) {
  //     // If dashboard doesn't exist in Firestore, create it with default values
  //     const defaultDashboard = { ...this.DEFAULT_DASHBOARD } as UserDashboard;

  //     await setDoc(dashboardRef, defaultDashboard);

  //     // Add content to widgets for return value
  //     defaultDashboard.widgets.forEach((widget) => {
  //       const content = widgetsDirectory.find(
  //         (w) => w.id === widget.id
  //       )?.content;
  //       if (content) {
  //         widget.content = content;
  //       }
  //     });

  //     return defaultDashboard;
  //   }

  //   // Dashboard exists, get it from Firestore
  //   const dashboardData = dashboardDoc.data() as UserDashboard;

  //   // Add content to widgets
  //   dashboardData.widgets.forEach((widget) => {
  //     const content = widgetsDirectory.find((w) => w.id === widget.id)?.content;
  //     if (content) {
  //       widget.content = content;
  //     }
  //   });

  //   return dashboardData;
  // }

  async saveWidgets(widgets: Widget[]): Promise<void> {
    const user = this.authService.user() as User;
    const storedData = localStorage.getItem(this.STORAGE_KEY + user.uid);
    const dashboard = storedData
      ? JSON.parse(storedData)
      : { widgets: [], order: [] };

    const widgetsWithoutContent: Partial<Widget>[] = widgets.map((w) => ({
      ...w,
    }));
    widgetsWithoutContent.forEach((w) => {
      delete w.content;
    });

    dashboard.widgets = widgetsWithoutContent;
    localStorage.setItem(
      this.STORAGE_KEY + user.uid,
      JSON.stringify(dashboard)
    );
    return Promise.resolve();
  }

  // Firestore implementation to save widgets to Firestore DB

  // async saveWidgets(widgets: Widget[]): Promise<void> {
  //   const user = this.authService.user() as User;
  //   const dashboardRef = doc(this.firebaseService.db, 'dashboards', user.uid);

  //   // Create widgets without content property
  //   const widgetsWithoutContent: Partial<Widget>[] = widgets.map((w) => ({
  //     ...w,
  //   }));
  //   widgetsWithoutContent.forEach((w) => {
  //     delete w.content;
  //   });

  //   // Save to Firestore
  //   return updateDoc(dashboardRef, { widgets: widgetsWithoutContent });
  // }

  async saveOrder(order: number[]): Promise<void> {
    const user = this.authService.user() as User;
    const storedData = localStorage.getItem(this.STORAGE_KEY + user.uid);
    const dashboard = storedData
      ? JSON.parse(storedData)
      : { widgets: [], order: [] };

    dashboard.order = order;
    localStorage.setItem(
      this.STORAGE_KEY + user.uid,
      JSON.stringify(dashboard)
    );
    return Promise.resolve();
  }

  //  Firestore implementation to save widget order to Firestore DB

  // async saveOrder(order: number[]): Promise<void> {
  //   const user = this.authService.user() as User;
  //   const dashboardRef = doc(this.firebaseService.db, 'dashboards', user.uid);

  //   // Save to Firestore
  //   return updateDoc(dashboardRef, { order });
  // }
}
