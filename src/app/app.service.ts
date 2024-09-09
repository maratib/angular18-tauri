import {
  IArt,
  IArticle,
  ICat,
  ICreateRowResponse,
  articles,
} from "./lib/types";
import { Injectable } from "@angular/core";
import Database from "@tauri-apps/plugin-sql";
import { initDb } from "./lib/migrate";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { fetchUrl, getJobsList, parseArticle } from "./lib/net";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

@Injectable({
  providedIn: "root",
})
export class AppService {
  private notificationPermissionGranted = false;
  private alertSound = new Audio();
  private catListSubject = new BehaviorSubject<ICat[]>([]);
  catList$ = this.catListSubject.asObservable();

  private articlesSubject = new BehaviorSubject<IArt[]>([]);
  articlesList$ = this.articlesSubject.asObservable();

  private selectedCatSubject = new BehaviorSubject<number>(-1);
  selectedCat$ = this.selectedCatSubject.asObservable();

  constructor(private http: HttpClient) {}

  private async connect() {
    return await Database.load("sqlite:test.db");
  }

  async init() {
    const db = await this.connect();
    await initDb(db);
    this.pushToCatList(await this.getCats());
    this.pushToArticles(await this.getNewArticles());
    const permission = await requestPermission();
    if (permission === "granted") this.notificationPermissionGranted = true;
    this.alertSound.src = "../assets/alert.mp3";
    this.alertSound.load();
    db.close();
  }

  private pushToCatList(cat: ICat[]) {
    this.catListSubject.next([...this.catListSubject.value, ...cat]);
  }

  private pushToArticles(articles: IArt[]) {
    this.articlesSubject.next([...this.articlesSubject.value, ...articles]);
  }

  public setSelectedCat(id: number) {
    this.selectedCatSubject.next(id);
  }

  async addCat(cat: string) {
    cat = cat.toLowerCase();
    const db = await this.connect();
    const result: ICreateRowResponse = await db.execute(
      "INSERT INTO cats (title) VALUES ($1)",
      [cat]
    );

    if (result?.rowsAffected == 1) {
      const newCat = [{ id: result.lastInsertId, title: cat }];
      this.pushToCatList(newCat);
    }
  }

  async addJOb(cat: number, aid: string) {
    const db = await this.connect();
    let result: ICreateRowResponse = {
      rowsAffected: 0,
      lastInsertId: 0,
    };
    try {
      result = await db.execute("INSERT INTO art (cat, aid) VALUES ($1, $2)", [
        cat,
        aid,
      ]);
    } catch (e) {
      console.log(e);
    }
    db.close();
    return result;
  }

  async getCats(): Promise<ICat[]> {
    const db = await this.connect();
    const catList: ICat[] = await db.select(
      "SELECT rowid as id, title FROM cats"
    );
    db.close();
    return catList;
  }

  async getUnfetchedArticles(): Promise<IArt[]> {
    const db = await this.connect();
    const articleList: [] = await db.select(
      "SELECT rowid as id, aid FROM art where fetched = 0"
    );
    db.close();
    return articleList;
  }

  notifyAlert(message: string) {
    if (this.notificationPermissionGranted) {
      sendNotification({ title: "Job Alert", body: message });
      this.alertSound.play();
    }
  }

  async updateSeen(id: number) {
    const db = await this.connect();
    const result: ICreateRowResponse = await db.execute(
      "UPDATE art set seen = 1 WHERE rowid = $1",
      [id]
    );
    db.close();
    return result;
  }

  async updateJob(article: IArticle) {
    const db = await this.connect();
    let response: ICreateRowResponse = {
      rowsAffected: 0,
      lastInsertId: 0,
    };
    try {
      response = await db.execute(
        "UPDATE art set fetched = 1, title = $1, description = $2, activities = $3, features = $4 WHERE rowid = $5",
        [
          article.title,
          article.description,
          JSON.stringify(article.activities),
          JSON.stringify(article.features),
          article.id,
        ]
      );

      const articleList: [] = await db.select(
        "SELECT rowid as id, * FROM art WHERE rowid = $1",
        [article.id]
      );
      console.log("Article : ", articleList.length);
      this.pushToArticles(articleList);
    } catch (e) {
      console.log(e);
    }
    db.close();
    return response;
  }

  async getArticleById(id: number): Promise<IArt[]> {
    const db = await this.connect();
    const articleList: [] = await db.select(
      "SELECT rowid as id, * FROM art WHERE rowid = $1",
      [id]
    );
    db.close();
    return articleList;
  }

  async getNewArticles(): Promise<IArt[]> {
    const db = await this.connect();
    const articleList: [] = await db.select(
      "SELECT rowid as id, * FROM art WHERE fetched = 1 ORDER BY rowid DESC LIMIT 50"
    );
    db.close();
    return articleList;
  }

  async printCats() {
    // const articleList = await this.getUnfetchedArticles();
    // console.log(articleList);
    // console.log(this.catListSubject.value);
    // console.log("Notify: ", this.notificationPermissionGranted);
    // await this.addJOb(1, "~021832885711830519743");
    // NOW: fetch each job and parse it
    // this.doFetchArticles();
    // const newJobs = await this.getUnfetchedArticles();
    // console.log(newJobs);
    // const articles = await this.getArticles();
    // console.log(articles);
    // const aList = await this.getNewArticles();
    // console.log(JSON.stringify(aList));
    const aList = await this.getArticleById(1);
    this.pushToArticles(aList);
    console.log(JSON.stringify(aList));
  }

  async doFetchArticles() {
    const newJobs = await this.getUnfetchedArticles();
    if (newJobs.length === 0) return;

    const job = newJobs[0];
    console.log(job);
    newJobs.forEach(async (job) => {
      if (job) {
        const url = `https://www.upwork.com/jobs/${job.aid}`;

        const httpResponse = await fetchUrl(url);
        if (httpResponse.status == 200) {
          // const article: IArt = parseArticle(httpResponse.text);
          const article: IArticle = parseArticle(httpResponse.text);
          if (article.status) {
            article.id = job.id;
            const response = await this.updateJob(article);
            if (response.rowsAffected) {
              this.notifyAlert(article.title);
              // console.log(article);
            }
          }
        } else {
          console.log("Error : ", httpResponse.status);
        }
      }
    });
  }

  async doFetchJobs() {
    this.catListSubject.value.forEach(async (cat) => {
      console.log("Calling doFetchJob");
      const validUrl = cat.title.replaceAll(" ", "+");
      const url = `https://www.upwork.com/search/jobs/?q=${validUrl}&sort=recency`;
      const httpResponse = await fetchUrl(url);
      if (httpResponse.status == 200) {
        const jobList = getJobsList(httpResponse.text);
        if (cat?.lastId !== jobList[0]) {
          cat.lastId = jobList[0];
          jobList.forEach(async (job) => {
            await this.addJOb(cat.id, job);
          });
        }
      } else {
        console.log("Error : ", httpResponse.status);
      }
    });

    this.doFetchArticles();
  }

  // private getAllJobs(url: string): Observable<any> {
  //   return this.http.get<any>(url);
  // }
}
