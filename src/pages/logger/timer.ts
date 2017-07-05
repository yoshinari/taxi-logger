
export default class MyTimer {
    clock: { [key: string]: string } = {};
    timer: Date;
    timeString: string;

    old: number;
    now: Date;
    hours: number;
    mins: number;
    secs: number;

    hms: number[];

    storage: Storage;
    // constructor(private storage: Storage) {
    // }
    public showClock() {
        this.timer = new Date();
        // 平成しか考えていない。何故って次は未定だから。
        this.clock["gengou"] = this.timer.getFullYear() + "年" + (this.timer.getMonth() + 1) + "月" + this.timer.getDate() + "日 (平成" + (this.timer.getFullYear() - 1988) + "年)";
        this.clock["clock"] = ("0" + this.timer.getHours()).substr(-2) + ":" + ("0" + this.timer.getMinutes()).substr(-2) + ":" + ("0" + this.timer.getSeconds()).substr(-2);
        return this.clock;
    }
}
export { MyTimer };