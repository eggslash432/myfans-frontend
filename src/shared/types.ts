type PostMedia = {
  id: string;
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  sortOrder?: number;
};

type Post = {
  id: string;
  title: string;
  body: string;
  visibility: string;
  // ほかフィールドがあればそのまま
  media?: PostMedia[];
};