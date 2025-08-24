export interface BlogArchive {
  id: string;
  title: string;
  slug: string;
  intro: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: string;
  content: string;
}

export interface BlogResponse {
  archive: BlogArchive;
  posts: {
    $type: string;
    $values: BlogPost[];
  };
}

// Legacy interface for backward compatibility
export interface blog {
  id: number;
  img: string;
  title: string;
  writer: string;
  comment: number;
  seen: number;
}
