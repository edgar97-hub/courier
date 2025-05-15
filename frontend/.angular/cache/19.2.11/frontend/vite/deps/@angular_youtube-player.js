import "./chunk-HXPPNCDT.js";
import {
  isPlatformBrowser
} from "./chunk-RMGTY45G.js";
import {
  CSP_NONCE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  InjectionToken,
  Input,
  NgModule,
  NgZone,
  Output,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  numberAttribute,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵviewQuery
} from "./chunk-7L7X77UR.js";
import "./chunk-5KXDAEEK.js";
import {
  fromEventPattern
} from "./chunk-VMI3K6GE.js";
import {
  BehaviorSubject,
  Observable,
  Subject,
  of,
  switchMap,
  takeUntil
} from "./chunk-WD6C567C.js";
import "./chunk-HM5YLMWO.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-TXDUYLVM.js";

// node_modules/@angular/youtube-player/fesm2022/youtube-player.mjs
var _c0 = ["youtubeContainer"];
function YouTubePlayer_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "youtube-player-placeholder", 2);
    ɵɵlistener("click", function YouTubePlayer_Conditional_0_Template_youtube_player_placeholder_click_0_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1._load(true));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("videoId", ctx_r1.videoId)("width", ctx_r1.width)("height", ctx_r1.height)("isLoading", ctx_r1._isLoading)("buttonLabel", ctx_r1.placeholderButtonLabel)("quality", ctx_r1.placeholderImageQuality);
  }
}
var YouTubePlayerPlaceholder = class _YouTubePlayerPlaceholder {
  /** ID of the video for which to show the placeholder. */
  videoId;
  /** Width of the video for which to show the placeholder. */
  width;
  /** Height of the video for which to show the placeholder. */
  height;
  /** Whether the video is currently being loaded. */
  isLoading;
  /** Accessible label for the play button. */
  buttonLabel;
  /** Quality of the placeholder image. */
  quality;
  /** Gets the background image showing the placeholder. */
  _getBackgroundImage() {
    let url;
    if (this.quality === "low") {
      url = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
    } else if (this.quality === "high") {
      url = `https://i.ytimg.com/vi/${this.videoId}/maxresdefault.jpg`;
    } else {
      url = `https://i.ytimg.com/vi_webp/${this.videoId}/sddefault.webp`;
    }
    return `url(${url})`;
  }
  static ɵfac = function YouTubePlayerPlaceholder_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _YouTubePlayerPlaceholder)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _YouTubePlayerPlaceholder,
    selectors: [["youtube-player-placeholder"]],
    hostAttrs: [1, "youtube-player-placeholder"],
    hostVars: 8,
    hostBindings: function YouTubePlayerPlaceholder_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵstyleProp("background-image", ctx._getBackgroundImage())("width", ctx.width, "px")("height", ctx.height, "px");
        ɵɵclassProp("youtube-player-placeholder-loading", ctx.isLoading);
      }
    },
    inputs: {
      videoId: "videoId",
      width: "width",
      height: "height",
      isLoading: "isLoading",
      buttonLabel: "buttonLabel",
      quality: "quality"
    },
    decls: 4,
    vars: 1,
    consts: [["type", "button", 1, "youtube-player-placeholder-button"], ["height", "100%", "version", "1.1", "viewBox", "0 0 68 48", "focusable", "false", "aria-hidden", "true"], ["d", "M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z", "fill", "#f00"], ["d", "M 45,24 27,14 27,34", "fill", "#fff"]],
    template: function YouTubePlayerPlaceholder_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "button", 0);
        ɵɵnamespaceSVG();
        ɵɵelementStart(1, "svg", 1);
        ɵɵelement(2, "path", 2)(3, "path", 3);
        ɵɵelementEnd()();
      }
      if (rf & 2) {
        ɵɵattribute("aria-label", ctx.buttonLabel);
      }
    },
    styles: [".youtube-player-placeholder{display:flex;align-items:center;justify-content:center;width:100%;overflow:hidden;cursor:pointer;background-color:#000;background-position:center center;background-size:cover;transition:box-shadow 300ms ease;box-shadow:inset 0 120px 90px -90px rgba(0,0,0,.8)}:fullscreen .youtube-player-placeholder{min-width:100vw;min-height:100vh}.youtube-player-placeholder-button{transition:opacity 300ms ease;-moz-appearance:none;-webkit-appearance:none;background:none;border:none;padding:0;display:flex}.youtube-player-placeholder-button svg{width:68px;height:48px}.youtube-player-placeholder-loading{box-shadow:none}.youtube-player-placeholder-loading .youtube-player-placeholder-button{opacity:0}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(YouTubePlayerPlaceholder, [{
    type: Component,
    args: [{
      selector: "youtube-player-placeholder",
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      template: `
    <button type="button" class="youtube-player-placeholder-button" [attr.aria-label]="buttonLabel">
      <svg
        height="100%"
        version="1.1"
        viewBox="0 0 68 48"
        focusable="false"
        aria-hidden="true">
        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
        <path d="M 45,24 27,14 27,34" fill="#fff"></path>
      </svg>
    </button>
  `,
      host: {
        "class": "youtube-player-placeholder",
        "[class.youtube-player-placeholder-loading]": "isLoading",
        "[style.background-image]": "_getBackgroundImage()",
        "[style.width.px]": "width",
        "[style.height.px]": "height"
      },
      styles: [".youtube-player-placeholder{display:flex;align-items:center;justify-content:center;width:100%;overflow:hidden;cursor:pointer;background-color:#000;background-position:center center;background-size:cover;transition:box-shadow 300ms ease;box-shadow:inset 0 120px 90px -90px rgba(0,0,0,.8)}:fullscreen .youtube-player-placeholder{min-width:100vw;min-height:100vh}.youtube-player-placeholder-button{transition:opacity 300ms ease;-moz-appearance:none;-webkit-appearance:none;background:none;border:none;padding:0;display:flex}.youtube-player-placeholder-button svg{width:68px;height:48px}.youtube-player-placeholder-loading{box-shadow:none}.youtube-player-placeholder-loading .youtube-player-placeholder-button{opacity:0}\n"]
    }]
  }], null, {
    videoId: [{
      type: Input
    }],
    width: [{
      type: Input
    }],
    height: [{
      type: Input
    }],
    isLoading: [{
      type: Input
    }],
    buttonLabel: [{
      type: Input
    }],
    quality: [{
      type: Input
    }]
  });
})();
var YOUTUBE_PLAYER_CONFIG = new InjectionToken("YOUTUBE_PLAYER_CONFIG");
var DEFAULT_PLAYER_WIDTH = 640;
var DEFAULT_PLAYER_HEIGHT = 390;
function coerceTime(value) {
  return value == null ? value : numberAttribute(value, 0);
}
var PlayerState;
(function(PlayerState2) {
  PlayerState2[PlayerState2["UNSTARTED"] = -1] = "UNSTARTED";
  PlayerState2[PlayerState2["ENDED"] = 0] = "ENDED";
  PlayerState2[PlayerState2["PLAYING"] = 1] = "PLAYING";
  PlayerState2[PlayerState2["PAUSED"] = 2] = "PAUSED";
  PlayerState2[PlayerState2["BUFFERING"] = 3] = "BUFFERING";
  PlayerState2[PlayerState2["CUED"] = 5] = "CUED";
})(PlayerState || (PlayerState = {}));
var YouTubePlayer = class _YouTubePlayer {
  _ngZone = inject(NgZone);
  _nonce = inject(CSP_NONCE, {
    optional: true
  });
  _changeDetectorRef = inject(ChangeDetectorRef);
  _elementRef = inject(ElementRef);
  _player;
  _pendingPlayer;
  _existingApiReadyCallback;
  _pendingPlayerState;
  _destroyed = new Subject();
  _playerChanges = new BehaviorSubject(void 0);
  _isLoading = false;
  _hasPlaceholder = true;
  /** Whether we're currently rendering inside a browser. */
  _isBrowser;
  /** YouTube Video ID to view */
  videoId;
  /** Height of video player */
  get height() {
    return this._height;
  }
  set height(height) {
    this._height = height == null || isNaN(height) ? DEFAULT_PLAYER_HEIGHT : height;
  }
  _height = DEFAULT_PLAYER_HEIGHT;
  /** Width of video player */
  get width() {
    return this._width;
  }
  set width(width) {
    this._width = width == null || isNaN(width) ? DEFAULT_PLAYER_WIDTH : width;
  }
  _width = DEFAULT_PLAYER_WIDTH;
  /** The moment when the player is supposed to start playing */
  startSeconds;
  /** The moment when the player is supposed to stop playing */
  endSeconds;
  /** The suggested quality of the player */
  suggestedQuality;
  /**
   * Extra parameters used to configure the player. See:
   * https://developers.google.com/youtube/player_parameters.html?playerVersion=HTML5#Parameters
   */
  playerVars;
  /** Whether cookies inside the player have been disabled. */
  disableCookies = false;
  /** Whether to automatically load the YouTube iframe API. Defaults to `true`. */
  loadApi;
  /**
   * By default the player shows a placeholder image instead of loading the YouTube API which
   * improves the initial page load performance. This input allows for the behavior to be disabled.
   */
  disablePlaceholder = false;
  /**
   * Whether the iframe will attempt to load regardless of the status of the api on the
   * page. Set this to true if you don't want the `onYouTubeIframeAPIReady` field to be
   * set on the global window.
   */
  showBeforeIframeApiLoads = false;
  /** Accessible label for the play button inside of the placeholder. */
  placeholderButtonLabel;
  /**
   * Quality of the displayed placeholder image. Defaults to `standard`,
   * because not all video have a high-quality placeholder.
   */
  placeholderImageQuality;
  // Note: ready event can't go through the lazy emitter, because it
  // happens before the `_playerChanges` stream emits the new player.
  /** Emits when the player is initialized. */
  ready = new EventEmitter();
  /** Emits when the state of the player has changed. */
  stateChange = this._getLazyEmitter("onStateChange");
  /** Emits when there's an error while initializing the player. */
  error = this._getLazyEmitter("onError");
  /** Emits when the underlying API of the player has changed. */
  apiChange = this._getLazyEmitter("onApiChange");
  /** Emits when the playback quality has changed. */
  playbackQualityChange = this._getLazyEmitter("onPlaybackQualityChange");
  /** Emits when the playback rate has changed. */
  playbackRateChange = this._getLazyEmitter("onPlaybackRateChange");
  /** The element that will be replaced by the iframe. */
  youtubeContainer;
  constructor() {
    const platformId = inject(PLATFORM_ID);
    const config = inject(YOUTUBE_PLAYER_CONFIG, {
      optional: true
    });
    this.loadApi = config?.loadApi ?? true;
    this.disablePlaceholder = !!config?.disablePlaceholder;
    this.placeholderButtonLabel = config?.placeholderButtonLabel || "Play video";
    this.placeholderImageQuality = config?.placeholderImageQuality || "standard";
    this._isBrowser = isPlatformBrowser(platformId);
  }
  ngAfterViewInit() {
    this._conditionallyLoad();
  }
  ngOnChanges(changes) {
    if (this._shouldRecreatePlayer(changes)) {
      this._conditionallyLoad();
    } else if (this._player) {
      if (changes["width"] || changes["height"]) {
        this._setSize();
      }
      if (changes["suggestedQuality"]) {
        this._setQuality();
      }
      if (changes["startSeconds"] || changes["endSeconds"] || changes["suggestedQuality"]) {
        this._cuePlayer();
      }
    }
  }
  ngOnDestroy() {
    this._pendingPlayer?.destroy();
    if (this._player) {
      this._player.destroy();
      window.onYouTubeIframeAPIReady = this._existingApiReadyCallback;
    }
    this._playerChanges.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#playVideo */
  playVideo() {
    if (this._player) {
      this._player.playVideo();
    } else {
      this._getPendingState().playbackState = PlayerState.PLAYING;
      this._load(true);
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#pauseVideo */
  pauseVideo() {
    if (this._player) {
      this._player.pauseVideo();
    } else {
      this._getPendingState().playbackState = PlayerState.PAUSED;
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#stopVideo */
  stopVideo() {
    if (this._player) {
      this._player.stopVideo();
    } else {
      this._getPendingState().playbackState = PlayerState.CUED;
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#seekTo */
  seekTo(seconds, allowSeekAhead) {
    if (this._player) {
      this._player.seekTo(seconds, allowSeekAhead);
    } else {
      this._getPendingState().seek = {
        seconds,
        allowSeekAhead
      };
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#mute */
  mute() {
    if (this._player) {
      this._player.mute();
    } else {
      this._getPendingState().muted = true;
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#unMute */
  unMute() {
    if (this._player) {
      this._player.unMute();
    } else {
      this._getPendingState().muted = false;
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#isMuted */
  isMuted() {
    if (this._player) {
      return this._player.isMuted();
    }
    if (this._pendingPlayerState) {
      return !!this._pendingPlayerState.muted;
    }
    return false;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#setVolume */
  setVolume(volume) {
    if (this._player) {
      this._player.setVolume(volume);
    } else {
      this._getPendingState().volume = volume;
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getVolume */
  getVolume() {
    if (this._player) {
      return this._player.getVolume();
    }
    if (this._pendingPlayerState && this._pendingPlayerState.volume != null) {
      return this._pendingPlayerState.volume;
    }
    return 0;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#setPlaybackRate */
  setPlaybackRate(playbackRate) {
    if (this._player) {
      return this._player.setPlaybackRate(playbackRate);
    } else {
      this._getPendingState().playbackRate = playbackRate;
    }
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackRate */
  getPlaybackRate() {
    if (this._player) {
      return this._player.getPlaybackRate();
    }
    if (this._pendingPlayerState && this._pendingPlayerState.playbackRate != null) {
      return this._pendingPlayerState.playbackRate;
    }
    return 0;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailablePlaybackRates */
  getAvailablePlaybackRates() {
    return this._player ? this._player.getAvailablePlaybackRates() : [];
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoLoadedFraction */
  getVideoLoadedFraction() {
    return this._player ? this._player.getVideoLoadedFraction() : 0;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getPlayerState */
  getPlayerState() {
    if (!this._isBrowser || !window.YT) {
      return void 0;
    }
    if (this._player) {
      return this._player.getPlayerState();
    }
    if (this._pendingPlayerState && this._pendingPlayerState.playbackState != null) {
      return this._pendingPlayerState.playbackState;
    }
    return PlayerState.UNSTARTED;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getCurrentTime */
  getCurrentTime() {
    if (this._player) {
      return this._player.getCurrentTime();
    }
    if (this._pendingPlayerState && this._pendingPlayerState.seek) {
      return this._pendingPlayerState.seek.seconds;
    }
    return 0;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getPlaybackQuality */
  getPlaybackQuality() {
    return this._player ? this._player.getPlaybackQuality() : "default";
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getAvailableQualityLevels */
  getAvailableQualityLevels() {
    return this._player ? this._player.getAvailableQualityLevels() : [];
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getDuration */
  getDuration() {
    return this._player ? this._player.getDuration() : 0;
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoUrl */
  getVideoUrl() {
    return this._player ? this._player.getVideoUrl() : "";
  }
  /** See https://developers.google.com/youtube/iframe_api_reference#getVideoEmbedCode */
  getVideoEmbedCode() {
    return this._player ? this._player.getVideoEmbedCode() : "";
  }
  /**
   * Attempts to put the player into fullscreen mode, depending on browser support.
   * @param options Options controlling how the element behaves in fullscreen mode.
   */
  requestFullscreen(options) {
    return __async(this, null, function* () {
      const element = this._elementRef.nativeElement;
      return element.requestFullscreen ? element.requestFullscreen(options) : Promise.reject(new Error("Fullscreen API not supported by browser."));
    });
  }
  /**
   * Loads the YouTube API and sets up the player.
   * @param playVideo Whether to automatically play the video once the player is loaded.
   */
  _load(playVideo) {
    if (!this._isBrowser) {
      return;
    }
    if (!window.YT || !window.YT.Player) {
      if (this.loadApi) {
        this._isLoading = true;
        loadApi(this._nonce);
      } else if (this.showBeforeIframeApiLoads && (typeof ngDevMode === "undefined" || ngDevMode)) {
        throw new Error("Namespace YT not found, cannot construct embedded youtube player. Please install the YouTube Player API Reference for iframe Embeds: https://developers.google.com/youtube/iframe_api_reference");
      }
      this._existingApiReadyCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        this._existingApiReadyCallback?.();
        this._ngZone.run(() => this._createPlayer(playVideo));
      };
    } else {
      this._createPlayer(playVideo);
    }
  }
  /** Loads the player depending on the internal state of the component. */
  _conditionallyLoad() {
    if (!this._shouldShowPlaceholder()) {
      this._load(false);
    } else if (this.playerVars?.autoplay === 1) {
      this._load(true);
    }
  }
  /** Whether to show the placeholder element. */
  _shouldShowPlaceholder() {
    if (this.disablePlaceholder) {
      return false;
    }
    if (!this._isBrowser) {
      return true;
    }
    return this._hasPlaceholder && !!this.videoId && !this._player;
  }
  /** Gets an object that should be used to store the temporary API state. */
  _getPendingState() {
    if (!this._pendingPlayerState) {
      this._pendingPlayerState = {};
    }
    return this._pendingPlayerState;
  }
  /**
   * Determines whether a change in the component state
   * requires the YouTube player to be recreated.
   */
  _shouldRecreatePlayer(changes) {
    const change = changes["videoId"] || changes["playerVars"] || changes["disableCookies"] || changes["disablePlaceholder"];
    return !!change && !change.isFirstChange();
  }
  /**
   * Creates a new YouTube player and destroys the existing one.
   * @param playVideo Whether to play the video once it loads.
   */
  _createPlayer(playVideo) {
    this._player?.destroy();
    this._pendingPlayer?.destroy();
    if (typeof YT === "undefined" || !this.videoId && !this.playerVars?.list) {
      return;
    }
    const player = this._ngZone.runOutsideAngular(() => new YT.Player(this.youtubeContainer.nativeElement, {
      videoId: this.videoId,
      host: this.disableCookies ? "https://www.youtube-nocookie.com" : void 0,
      width: this.width,
      height: this.height,
      // Calling `playVideo` on load doesn't appear to actually play
      // the video so we need to trigger it through `playerVars` instead.
      playerVars: playVideo ? __spreadProps(__spreadValues({}, this.playerVars || {}), {
        autoplay: 1
      }) : this.playerVars
    }));
    const whenReady = (event) => {
      this._ngZone.run(() => {
        this._isLoading = false;
        this._hasPlaceholder = false;
        this._player = player;
        this._pendingPlayer = void 0;
        player.removeEventListener("onReady", whenReady);
        this._playerChanges.next(player);
        this.ready.emit(event);
        this._setSize();
        this._setQuality();
        if (this._pendingPlayerState) {
          this._applyPendingPlayerState(player, this._pendingPlayerState);
          this._pendingPlayerState = void 0;
        }
        const state = player.getPlayerState();
        if (state === PlayerState.UNSTARTED || state === PlayerState.CUED || state == null) {
          this._cuePlayer();
        } else if (playVideo && this.startSeconds && this.startSeconds > 0) {
          player.seekTo(this.startSeconds, true);
        }
        this._changeDetectorRef.markForCheck();
      });
    };
    this._pendingPlayer = player;
    player.addEventListener("onReady", whenReady);
  }
  /** Applies any state that changed before the player was initialized. */
  _applyPendingPlayerState(player, pendingState) {
    const {
      playbackState,
      playbackRate,
      volume,
      muted,
      seek
    } = pendingState;
    switch (playbackState) {
      case PlayerState.PLAYING:
        player.playVideo();
        break;
      case PlayerState.PAUSED:
        player.pauseVideo();
        break;
      case PlayerState.CUED:
        player.stopVideo();
        break;
    }
    if (playbackRate != null) {
      player.setPlaybackRate(playbackRate);
    }
    if (volume != null) {
      player.setVolume(volume);
    }
    if (muted != null) {
      muted ? player.mute() : player.unMute();
    }
    if (seek != null) {
      player.seekTo(seek.seconds, seek.allowSeekAhead);
    }
  }
  /** Cues the player based on the current component state. */
  _cuePlayer() {
    if (this._player && this.videoId) {
      this._player.cueVideoById({
        videoId: this.videoId,
        startSeconds: this.startSeconds,
        endSeconds: this.endSeconds,
        suggestedQuality: this.suggestedQuality
      });
    }
  }
  /** Sets the player's size based on the current input values. */
  _setSize() {
    this._player?.setSize(this.width, this.height);
  }
  /** Sets the player's quality based on the current input values. */
  _setQuality() {
    if (this._player && this.suggestedQuality) {
      this._player.setPlaybackQuality(this.suggestedQuality);
    }
  }
  /** Gets an observable that adds an event listener to the player when a user subscribes to it. */
  _getLazyEmitter(name) {
    return this._playerChanges.pipe(
      // Switch to the bound event. `switchMap` ensures that the old event is removed when the
      // player is changed. If there's no player, return an observable that never emits.
      switchMap((player) => {
        return player ? fromEventPattern((listener) => {
          player.addEventListener(name, listener);
        }, (listener) => {
          try {
            player?.removeEventListener?.(name, listener);
          } catch {
          }
        }) : of();
      }),
      // By default we run all the API interactions outside the zone
      // so we have to bring the events back in manually when they emit.
      (source) => new Observable((observer) => source.subscribe({
        next: (value) => this._ngZone.run(() => observer.next(value)),
        error: (error) => observer.error(error),
        complete: () => observer.complete()
      })),
      // Ensures that everything is cleared out on destroy.
      takeUntil(this._destroyed)
    );
  }
  static ɵfac = function YouTubePlayer_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _YouTubePlayer)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _YouTubePlayer,
    selectors: [["youtube-player"]],
    viewQuery: function YouTubePlayer_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c0, 7);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.youtubeContainer = _t.first);
      }
    },
    inputs: {
      videoId: "videoId",
      height: [2, "height", "height", numberAttribute],
      width: [2, "width", "width", numberAttribute],
      startSeconds: [2, "startSeconds", "startSeconds", coerceTime],
      endSeconds: [2, "endSeconds", "endSeconds", coerceTime],
      suggestedQuality: "suggestedQuality",
      playerVars: "playerVars",
      disableCookies: [2, "disableCookies", "disableCookies", booleanAttribute],
      loadApi: [2, "loadApi", "loadApi", booleanAttribute],
      disablePlaceholder: [2, "disablePlaceholder", "disablePlaceholder", booleanAttribute],
      showBeforeIframeApiLoads: [2, "showBeforeIframeApiLoads", "showBeforeIframeApiLoads", booleanAttribute],
      placeholderButtonLabel: "placeholderButtonLabel",
      placeholderImageQuality: "placeholderImageQuality"
    },
    outputs: {
      ready: "ready",
      stateChange: "stateChange",
      error: "error",
      apiChange: "apiChange",
      playbackQualityChange: "playbackQualityChange",
      playbackRateChange: "playbackRateChange"
    },
    features: [ɵɵNgOnChangesFeature],
    decls: 4,
    vars: 3,
    consts: [["youtubeContainer", ""], [3, "videoId", "width", "height", "isLoading", "buttonLabel", "quality"], [3, "click", "videoId", "width", "height", "isLoading", "buttonLabel", "quality"]],
    template: function YouTubePlayer_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, YouTubePlayer_Conditional_0_Template, 1, 6, "youtube-player-placeholder", 1);
        ɵɵelementStart(1, "div");
        ɵɵelement(2, "div", null, 0);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵconditional(ctx._shouldShowPlaceholder() ? 0 : -1);
        ɵɵadvance();
        ɵɵstyleProp("display", ctx._shouldShowPlaceholder() ? "none" : "");
      }
    },
    dependencies: [YouTubePlayerPlaceholder],
    styles: ["youtube-player:fullscreen,youtube-player:fullscreen iframe{min-width:100vw;min-height:100vh}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(YouTubePlayer, [{
    type: Component,
    args: [{
      selector: "youtube-player",
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      imports: [YouTubePlayerPlaceholder],
      template: `
    @if (_shouldShowPlaceholder()) {
      <youtube-player-placeholder
        [videoId]="videoId!"
        [width]="width"
        [height]="height"
        [isLoading]="_isLoading"
        [buttonLabel]="placeholderButtonLabel"
        [quality]="placeholderImageQuality"
        (click)="_load(true)"/>
    }
    <div [style.display]="_shouldShowPlaceholder() ? 'none' : ''">
      <div #youtubeContainer></div>
    </div>
  `,
      styles: ["youtube-player:fullscreen,youtube-player:fullscreen iframe{min-width:100vw;min-height:100vh}\n"]
    }]
  }], () => [], {
    videoId: [{
      type: Input
    }],
    height: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    width: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    startSeconds: [{
      type: Input,
      args: [{
        transform: coerceTime
      }]
    }],
    endSeconds: [{
      type: Input,
      args: [{
        transform: coerceTime
      }]
    }],
    suggestedQuality: [{
      type: Input
    }],
    playerVars: [{
      type: Input
    }],
    disableCookies: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    loadApi: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    disablePlaceholder: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    showBeforeIframeApiLoads: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    placeholderButtonLabel: [{
      type: Input
    }],
    placeholderImageQuality: [{
      type: Input
    }],
    ready: [{
      type: Output
    }],
    stateChange: [{
      type: Output
    }],
    error: [{
      type: Output
    }],
    apiChange: [{
      type: Output
    }],
    playbackQualityChange: [{
      type: Output
    }],
    playbackRateChange: [{
      type: Output
    }],
    youtubeContainer: [{
      type: ViewChild,
      args: ["youtubeContainer", {
        static: true
      }]
    }]
  });
})();
var apiLoaded = false;
function loadApi(nonce) {
  if (apiLoaded) {
    return;
  }
  const url = "https://www.youtube.com/iframe_api";
  const script = document.createElement("script");
  const callback = (event) => {
    script.removeEventListener("load", callback);
    script.removeEventListener("error", callback);
    if (event.type === "error") {
      apiLoaded = false;
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        console.error(`Failed to load YouTube API from ${url}`);
      }
    }
  };
  script.addEventListener("load", callback);
  script.addEventListener("error", callback);
  script.src = url;
  script.async = true;
  if (nonce) {
    script.setAttribute("nonce", nonce);
  }
  apiLoaded = true;
  document.body.appendChild(script);
}
var YouTubePlayerModule = class _YouTubePlayerModule {
  static ɵfac = function YouTubePlayerModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _YouTubePlayerModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _YouTubePlayerModule,
    imports: [YouTubePlayer],
    exports: [YouTubePlayer]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(YouTubePlayerModule, [{
    type: NgModule,
    args: [{
      imports: [YouTubePlayer],
      exports: [YouTubePlayer]
    }]
  }], null, null);
})();
export {
  YOUTUBE_PLAYER_CONFIG,
  YouTubePlayer,
  YouTubePlayerModule
};
//# sourceMappingURL=@angular_youtube-player.js.map
