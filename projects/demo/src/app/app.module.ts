import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { QueryParamControlModule } from 'projects/query-param-control/src/public-api';

import { AppComponent } from './app.component';
import { DemoComponent } from './demo/demo.component';
import { CustomSelectElementComponent } from './demo/custom-select-element/custom-select-element.component';

const routes = [
  {
    path: '',
    redirectTo: 'demo',
    pathMatch: 'full'
  },
  {
    path: 'demo',
    component: DemoComponent
  },
  {
    path: '**',
    redirectTo: 'demo'
  }
];

@NgModule({
  declarations: [AppComponent, DemoComponent, CustomSelectElementComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    QueryParamControlModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
