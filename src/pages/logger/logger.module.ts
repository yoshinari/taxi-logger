import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoggerPage } from './logger';

@NgModule({
  declarations: [
    LoggerPage,
  ],
  imports: [
    IonicPageModule.forChild(LoggerPage),
  ],
  exports: [
    LoggerPage
  ]
})
export class LoggerPageModule {}
