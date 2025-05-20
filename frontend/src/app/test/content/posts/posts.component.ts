import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export type Post = {
  id: number;
  title: string;
  body: string;
};

@Component({
    selector: 'app-posts',
    imports: [MatCardModule, MatButtonModule],
    template: `
    @for (post of posts(); track post.id) {
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ post.title }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>{{ post.body }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button>LIKE</button>
        <button mat-button>SHARE</button>
      </mat-card-actions>
    </mat-card>
    }
  `,
    styles: `
  
  :host {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 32px;
    padding: 32px;
  }

  `
})
export default class PostsComponent {
  posts = signal<Post[]>([]);

  ngOnInit() {
    fetch('https://dummyjson.com/posts')
      .then((res) => res.json())
      .then(({ posts }) => {
        this.posts.set(posts);
      });
  }
}
