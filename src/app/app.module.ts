import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { CowinService } from "./cowin.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, CommonModule, HttpClientModule, FormsModule],
  providers: [CowinService],
  bootstrap: [AppComponent],
})
export class AppModule {}
