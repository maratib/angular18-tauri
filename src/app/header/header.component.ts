import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { ICat } from "../lib/types";
import { SettingsComponent } from "../settings/settings.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [SettingsComponent],
  template: `
    <div class="flex flex-row gap-6 hover:flex-row p-2 border-b-2">
      <div class="link" (click)="catClick(0)">All</div>
      @for (item of catList ; track item.id) {
      <div class="link" (click)="catClick(item.id)">{{ item.title }}</div>
      }
      <div>
        <app-settings title="Settings" />
      </div>
      <button (click)="getData()">Get</button>
      <button (click)="printCats()">Print</button>
    </div>
  `,
})
export class HeaderComponent implements OnInit {
  catList: ICat[] = [];

  constructor(private appService: AppService) {
    this.appService.catList$.subscribe((list) => (this.catList = list));
  }
  async ngOnInit() {
    this.appService.init();
  }
  async getData() {
    await this.appService.doFetchJobs();
  }
  async catClick(val: number) {
    this.appService.setSelectedCat(val);
  }

  async printCats() {
    await this.appService.printCats();
  }
}
