import { Routes } from '@angular/router';

const contentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./content.component'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'videos',
      },
      {
        path: 'videos',
        loadComponent: () => import('./videos/videos.component'),
      },
      {
        path: 'posts',
        loadComponent: () => import('./posts/posts.component'),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./gallery/gallery.component'),
      },
    ],
  },
];

export default contentRoutes;
