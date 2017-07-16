import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoggerPage } from './logger';
import { DetailPage } from '../list/detail/detail';

@NgModule({
  declarations: [
    LoggerPage,
  ],
  imports: [
    IonicPageModule.forChild(LoggerPage),
    DetailPage,
  ],
  exports: [
    LoggerPage
  ]
})
export class LoggerPageModule {}
