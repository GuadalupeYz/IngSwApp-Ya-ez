export interface Blog {
  id: number;
  name: string;
  handle: string;
}

export interface Post {
  id?: number;
  title: string;
  content: string;
  date: string;
  blog?: Pick<Blog, 'id' | 'name'> | null;
}
