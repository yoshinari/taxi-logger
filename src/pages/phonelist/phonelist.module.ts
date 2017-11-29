import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhonelistPage } from './phonelist';

@NgModule({
  declarations: [
    PhonelistPage,
  ],
  imports: [
    IonicPageModule.forChild(PhonelistPage),
  ],
  exports: [
    PhonelistPage
  ]
})
export class PhonelistPageModule {}
