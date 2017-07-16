import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListPage } from './list';
// import { DetailPage } from './detail/detail';
import { HistoryPageModule } from './history/history.module';
import { DetailPageModule } from './detail/detail.module';

@NgModule({
    declarations: [
        ListPage,
    ],
    imports: [
        IonicPageModule.forChild(ListPage),
        HistoryPageModule,
        DetailPageModule,
    ],
    exports: [
        ListPage
    ]
})

export class ListPageModule { };
