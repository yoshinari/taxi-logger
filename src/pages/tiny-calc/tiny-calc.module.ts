import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TinyCalcPage } from './tiny-calc';

@NgModule({
  declarations: [
    TinyCalcPage,
  ],
  imports: [
    IonicPageModule.forChild(TinyCalcPage),
  ],
  exports: [
    TinyCalcPage
  ]
})
export class TinyCalcPageModule {}
