import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
// import { YouTubePlayer } from '@angular/youtube-player';
import { AppStore } from '../../../app.store';

export type Video = {
  id: string;
  snippet: {
    thumbnails: {
      standard: {
        url: string;
      };
    };
    description: string;
    publishedAt: string;
    title: string;
  };
};

@Component({
  selector: 'app-videos',
  // imports: [YouTubePlayer, DatePipe],
  template: `
    @for (video of videos(); track video.id) {
    <div class="flex gap-5">
      @defer (on interaction) {
      <!-- <youtube-player
        [playerVars]="{ autoplay: 1 }"
        [width]="300"
        [height]="150"
        [videoId]="video.id"
      /> -->
      } @placeholder {
      <div class="min-w-[300px]">
        <img
          class="rounded-2xl w-[300px] h-[150px] object-cover"
          [src]="video.snippet.thumbnails.standard.url"
        />
      </div>
      }
      <div>
        <h4 class="text-xl mb-1">{{ video.snippet.title }}</h4>
        <!-- <p class="text-base mb-3">
          {{ video.snippet.publishedAt | date }}
        </p> -->
        <p class="line-clamp-3 text-slate-600 dark:text-slate-400">
          {{ video.snippet.description }}
        </p>
      </div>
    </div>
    }
  `,
  styles: `

    :host {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    youtube-player ::ng-deep .youtube-player-placeholder {
      border-radius: 16px;
    }

    .video-item {
      display: flex;
      gap: 24px;

      .title {
        font-size: 1.2rem;
        margin: 0;
        margin-bottom: 8px;
      }

      .date {
        font-size: 1rem;
        margin: 0;
        margin-bottom: 16px;
      }

      .desc {
        font-size: 0.9rem;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        line-clamp: 4;
        overflow: hidden;
        -webkit-box-orient: vertical;
      }
    }

    .placeholder {

      cursor: pointer;
      img {
        width: 400px;
        height: 200px;
        border-radius: 16px;
        object-fit: cover;
      }
     
    }

  `,
})
export default class VideosComponent {
  videoIds = [
    'Irf4aZC3LPY',
    'MtTAfjiZxtk',
    'I13uAoOGU_4',
    'plQJIgD2rl8',
    'vHNeAqgNM4o',
    'h6-BhzFD1CM',
  ];

  videos = signal<Video[]>([]);

  appStore = inject(AppStore);

  async ngOnInit() {
    this.appStore.startLoading();
    const videoIdsEncoded = encodeURIComponent(this.videoIds.join(','));
    const key = 'AIzaSyDd_1H0TuWt40lkkhU-F46wrPNxgdeFYow'; //Add your youtube API key here
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoIdsEncoded}&key=${key}`;

    const response = await fetch(url);
    const result = await response.json();
    this.videos.set(result.items);
    this.appStore.stopLoading();
  }
}
