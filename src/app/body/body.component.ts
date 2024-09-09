import { IArt } from "./../lib/types";
import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { CommonModule } from "@angular/common";
import { timer } from "rxjs";

@Component({
  selector: "app-body",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./body.component.html",
  styleUrl: "./body.component.css",
})
export class BodyComponent implements OnInit {
  catId = 0;
  articlesList: IArt[] = [];
  // filteredArticlesList: IArt[] = [];
  selectedArticle = {} as IArt;

  constructor(private appService: AppService) {
    this.appService.articlesList$.subscribe(
      (list) => (this.articlesList = list)
    );

    this.appService.selectedCat$.subscribe((catId) => {
      this.catId = catId;
      // console.log("selectedCat : " + catId);
      // if (catId !== 0) {
      //   this.filteredArticlesList = this.articlesList.filter(
      //     (article) => article.cat == catId
      //   );
      // } else {
      //   this.filteredArticlesList = this.articlesList;
      // }
    });
  }
  ngOnInit(): void {
    timer(3000).subscribe(async () => {
      this.appService.setSelectedCat(0);
      // await this.appService.doFetchJobs();
    });
  }

  selectArticle(article: IArt) {
    console.log("Article : ", article.id);
    this.selectedArticle = article;
  }
}
