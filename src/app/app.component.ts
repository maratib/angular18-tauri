import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header/header.component";
import { BodyComponent } from "./body/body.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, HeaderComponent, BodyComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {}
