import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { AppService } from "../app.service";
import { ICat } from "../lib/types";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [],
  template: `
    <div>
      <button (click)="appDialog.showModal()">Settings</button>
      <dialog
        #appDialog
        class="border border-primary bg-secondary text-primary w-fit max-w-screen-sm"
      >
        <div
          class="flex justify-between items-center w-full border-b border-slate-300 p-2"
        >
          <span class="text-xl font-semibold">{{ title }}</span>
          <button class="text-2xl" (click)="appDialog.close()">X</button>
        </div>
        <div class="p-4">
          <form class="" (submit)="createCat($event, catInput.value)">
            <input
              #catInput
              id="cat-input"
              required
              placeholder="Category a name..."
            />
            <button type="submit">Add</button>
          </form>
        </div>
      </dialog>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  @Input() title = "Alert";

  @ViewChild("appDialog", { static: true })
  dialog!: ElementRef<HTMLDialogElement>;

  cdr = inject(ChangeDetectorRef);

  catList: ICat[] = [];

  constructor(private appService: AppService) {
    this.appService.catList$.subscribe((list) => (this.catList = list));
  }
  ngOnInit(): void {
    // this.dialog.nativeElement.showModal();
    // this.cdr.detectChanges();
  }

  async createCat(event: SubmitEvent, catName: string) {
    event.preventDefault();
    await this.appService.addCat(catName);
  }
}
