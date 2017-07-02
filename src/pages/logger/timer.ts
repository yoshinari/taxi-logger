export default class MyTimer
{
    clock:{[key: string]:string}={};
    timer:Date;

    old:number;
    now:Date;
    hours:number;
    mins:number;
    secs:number;

    hms:number[];

    public showClock(){
        this.timer = new Date();
        // 平成しか考えていない。何故って次は未定だから。
        this.clock["gengou"]=this.timer.getFullYear()+"年"+(this.timer.getMonth()+1)+"月"+this.timer.getDate()+"日 (平成" + (this.timer.getFullYear() - 1988) + "年)";
        this.clock["clock"]=("0" + this.timer.getHours()).substr(-2) + ":" + ("0" + this.timer.getMinutes()).substr(-2) + ":" + ("0" + this.timer.getSeconds()).substr(-2);
        return this.clock;
    }

    public loadTimer(storageValue){
        if (!localStorage.getItem(storageValue)){
            return ("00:00:00");
        }
        this.old = Number(localStorage.getItem(storageValue));
        this.now = new Date();
        this.secs = Number(this.now.getTime()) - this.old;
        this.hours = 0;
        this.mins = 0;
        this.secs = Math.floor(this.secs/1000);
        this.hours = Math.floor(this.secs / (60 * 60));
        this.secs = this.secs - this.hours*60*60;
        this.mins = Math.floor(this.secs / 60);
        this.secs = this.secs - this.mins*60;
        return ("0" + this.hours).substr(-2) + ":" + ("0" + this.mins).substr(-2) + ":" + ("0" + this.secs).substr(-2);
    }
    public loadElapsedBreakTime(breakTime){
        if (!localStorage.getItem("elapsedBreak")){
            return breakTime;
        } else {
            this.hms = breakTime.split(':');
            this.secs = Number(this.hms[0])*60*60+Number(this.hms[1])*60+Number(this.hms[2])+Number(localStorage.getItem("elapsedBreak"));
        this.hours = 0;
        this.mins = 0;
        this.hours = Math.floor(this.secs / (60 * 60));
        this.secs = this.secs - this.hours*60*60;
        this.mins = Math.floor(this.secs / 60);
        this.secs = this.secs - this.mins*60;
        return ("0" + this.hours).substr(-2) + ":" + ("0" + this.mins).substr(-2) + ":" + ("0" + this.secs).substr(-2);
        }

    }
    public setTimer(storageValue){
        if (!localStorage.getItem(storageValue)){
            localStorage.setItem(storageValue,Date.now().toString()); // Date.now()の結果を文字列にしてlocalStorageに保存する
            console.log("set "+ storageValue +" to localStorage as "+localStorage.getItem(storageValue));
        }
    }
    public resetTimer(storageValue){
        if (localStorage.getItem(storageValue)){
            console.log("remove "+ storageValue + " from localStorage!");
            localStorage.removeItem(storageValue);
        }
    }
    public saveElapsedBreak(addTime){
        this.hms = addTime.split(':');
        console.log('addTime:'+addTime);
        console.log(this.hms[0]+ "," + this.hms[1] + "," + this.hms[2]);
        var adds:number = Number(this.hms[0]*60*60)+Number(this.hms[1]*60)+Number(this.hms[2]);
        console.log('adds:'+adds);
        if (!localStorage.getItem("elapsedBreak")){
            localStorage.setItem("elapsedBreak",adds.toString());
        } else {
            localStorage.setItem("elapsedBreak",(Number(localStorage.getItem("elapsedBreak"))+adds).toString());
        }
        console.log("elapsedBreak:"+localStorage.getItem("elapsedBreak"));
    }
}
export {MyTimer};