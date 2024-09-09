export type HTTPResponse = {
  status: number;
  text: string;
};

export interface ICat {
  id: number;
  title: string;
  lastId?: string;
}

export interface IArt {
  id: number;
  aid: string;
  cat: number;
  catName?: string;
  title: string;
  description: string;
  fetched: number;
  seen: number;
  dated: Date;
}

export interface IArticle {
  id?: number;
  title: string;
  description: string | null;
  activities: string[];
  features: string[];
  status: boolean;
}

export interface ICreateRowResponse {
  lastInsertId: number;
  rowsAffected: number;
}

export const articles = (): IArt[] => {
  const data: IArt[] = [
    {
      id: 1,
      aid: "1",
      cat: 1,
      title: "title 1",
      description: "description 1",
      fetched: 1,
      seen: 0,
      dated: new Date(),
    },
    {
      id: 2,
      aid: "2",
      cat: 2,
      title: "title 2",
      description: "description 2",
      fetched: 1,
      seen: 0,
      dated: new Date(),
    },
    {
      id: 3,
      aid: "3",
      cat: 1,
      title: "title 3",
      description: "description 3",
      fetched: 1,
      seen: 1,
      dated: new Date(),
    },
  ];
  return data;
};
