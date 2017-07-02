import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ThanksPage } from './thanks';

@NgModule({
  declarations: [
    ThanksPage,
  ],
  imports: [
    IonicPageModule.forChild(ThanksPage),
  ],
  exports: [
    ThanksPage
  ]
})
export class ThanksPageModule {}
