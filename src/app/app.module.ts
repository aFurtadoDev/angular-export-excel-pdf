import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';

import { TemplateComponent } from './template/template.component';
import { AngularMaterialModule } from './angular-material/angular-material.module';

@NgModule({
  imports: [BrowserModule, FormsModule, AngularMaterialModule],
  declarations: [AppComponent, HelloComponent, TemplateComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
