import { NgOptimizedImage } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-gallery',
    imports: [NgOptimizedImage],
    template: `
    @for (image of images(); track image) {
    <img [ngSrc]="image" height="200" width="250" />
    }
  `,
    styles: `
  
  :host {
    padding: 32px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  `
})
export default class GalleryComponent {
  images = signal<string[]>(
    [
      'nature',
      'sky',
      'grass',
      'mountains',
      'rivers',
      'glacier',
      'forest',
      'streams',
      'rain',
      'clouds',
    ].map((i) => `https://loremflickr.com/320/240/${i}`)
  );

  ngOnInit() {
    [
      'nature',
      'sky',
      'grass',
      'mountains',
      'rivers',
      'glacier',
      'forest',
      'streams',
      'rain',
      'clouds',
    ];
  }
}
