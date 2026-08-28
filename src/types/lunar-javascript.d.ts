/**
 * lunar-javascript는 타입 정의를 제공하지 않아서, 이 프로젝트가 실제로 쓰는
 * 메서드만 골라 선언한다. 새 메서드를 쓰게 되면 여기에 추가할 것.
 */
declare module 'lunar-javascript' {
  export class EightChar {
    getYear(): string
    getMonth(): string
    getDay(): string
    getTime(): string
    getYearGan(): string
    getMonthGan(): string
    getDayGan(): string
    getTimeGan(): string
    getYearZhi(): string
    getMonthZhi(): string
    getDayZhi(): string
    getTimeZhi(): string
    getYearWuXing(): string
    getMonthWuXing(): string
    getDayWuXing(): string
    getTimeWuXing(): string
    getYearNaYin(): string
    getDayNaYin(): string
    getDayShiShenGan(): string
    /** 대운. gender는 1이 남자, 0이 여자다. */
    getYun(gender: number): Yun
  }

  export class Yun {
    /** 순행이면 true */
    isForward(): boolean
    getStartYear(): number
    getStartMonth(): number
    getStartDay(): number
    getDaYun(): DaYun[]
  }

  export class DaYun {
    /** 세는나이 기준 */
    getStartAge(): number
    getEndAge(): number
    getStartYear(): number
    getEndYear(): number
    /** 대운이 시작되기 전 구간은 빈 문자열 */
    getGanZhi(): string
  }

  export class Lunar {
    getEightChar(): EightChar
    /** 음력 설 기준 띠 (한국에서 통상 말하는 띠) */
    getYearShengXiao(): string
    /** 입춘 기준 띠 (사주 명리 기준) */
    getYearShengXiaoByLiChun(): string
    getYearInGanZhi(): string
    getYearInGanZhiByLiChun(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getYear(): number
    getMonth(): number
    getDay(): number
  }

  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar
    static fromDate(date: Date): Solar
    getLunar(): Lunar
    /** 서양 별자리 (한자 약칭) */
    getXingZuo(): string
    /** 0 = 일요일 */
    getWeek(): number
    getYear(): number
    getMonth(): number
    getDay(): number
  }
}
