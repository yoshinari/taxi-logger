import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the HashdialPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
/*
https://lifehackdev.xsrv.jp/ZakkiBlog/articles/detail/web2
a href="tel:"に#(シャープ、ハッシュ)は使えない
androidでは#を使っても発信できる方法がある
「# を %23 と置き換えることで、android端末では発信できるけど、iPhoneでは発信できないよ」
https://forum.jquery.com/topic/problem-with-hash-encoded-with-href-tel-on-iphone-7j
*/
@Pipe({
  name: 'hashdial',
})
export class HashdialPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value) {
    return value.replace(/#/,"%23");
  }
}
