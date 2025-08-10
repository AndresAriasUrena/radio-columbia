export interface Author {
  name: string;
  description: string;
  imageUrl: string;
  instagramUrl?: string;
  status: 'actual' | 'historial';
  podcastName: string;
  podcastId: string;
}

export interface PodcastShow {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  rssUrl: string;
  language?: string;
  author?: string;
  category?: string;
  lastBuildDate?: string;
  authors?: Author[];
  status: 'actual' | 'historial';
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  pubDate: string;
  guid: string;
  showId: string;
}

export interface RSSFeedData {
  title: string;
  description: string;
  image: string;
  link: string;
  language?: string;
  author?: string;
  category?: string;
  lastBuildDate?: string;
  episodes: Array<{
    title: string;
    description: string;
    audioUrl: string;
    duration: string;
    pubDate: string;
    guid: string;
  }>;
}

export interface PodcastsResponse {
  shows: PodcastShow[];
  totalShows: number;
} 