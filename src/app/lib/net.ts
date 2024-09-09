import { fetch } from "@tauri-apps/plugin-http";
import { HTTPResponse, IArt, IArticle } from "./types";
import * as cheerio from "cheerio";

export async function fetchUrl(url: string): Promise<HTTPResponse> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0",
    },
  });

  const status = response.status;
  const text = await response.text();

  return { status, text };
}

export function getJobsList(contents: string) {
  const jobList = [...contents.matchAll(/\b~0\S*\/\?/g)];

  const list: string[] = [];

  jobList.forEach((item) => {
    list.push(item[0].replace("/?", ""));
  });

  return list;
}

export const clearJunk = (junk: string, lineClear = true) => {
  if (lineClear) {
    junk = junk.replace(/\n/g, "");
  }
  junk = junk.replace(/\t/g, "");
  return junk.trim();
};

export const parseArticle = (rawHtml: string): IArticle => {
  let article: IArticle = {
    title: "",
    description: "",
    activities: [],
    features: [],
    status: false,
  };

  try {
    let $ = cheerio.load(rawHtml);
    const main = $(".air3-card-sections.flex-1");
    $ = cheerio.load(main.html()!);
    article.title = $("h4").first().text();
    article.description = $(".text-body-sm").html();

    $(".value").each(function (i, el) {
      article.activities.push(clearJunk($(el).text()));
    });

    const features: string[] = [];
    $(".features").each(function (i, el) {
      article.features.push(clearJunk($(el).text()));
    });
    article.status = true;

    return article;
  } catch (error) {
    return article;
  }
};
