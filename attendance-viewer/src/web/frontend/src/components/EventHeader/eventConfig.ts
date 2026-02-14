// 日付イベントの型定義
export interface DateEvent {
    startMonth: number; // 1-12
    startDay: number;
    endMonth?: number; // オプション。指定しない場合は単日イベント
    endDay?: number; // オプション。指定しない場合は単日イベント
    name: string;
    leftIcon: string; // 左側のアイコン（絵文字）
    rightIcon: string; // 右側のアイコン（絵文字）
}

// イベントカレンダー定義
export const DATE_EVENTS: DateEvent[] = [
    // クリスマス（12/23～25）
    {
        startMonth: 12, startDay: 23,
        endMonth: 12, endDay: 25,
        name: 'Christmas',
        leftIcon: '🎄',
        rightIcon: '🎅'
    },
    
    // 正月（12/31～1/6）
    {
        startMonth: 12, startDay: 31,
        endMonth: 1, endDay: 6,
        name: 'New Year',
        leftIcon: '🎍',
        rightIcon: '🍊'
    },
    
    // 節分（2/2～2/4）
    {
        startMonth: 2, startDay: 2,
        endMonth: 2, endDay: 4,
        name: 'Setsubun',
        leftIcon: '👹',
        rightIcon: '🫘'
    },
    
    // バレンタイン（2/13～2/15）
    {
        startMonth: 2, startDay: 13,
        endMonth: 2, endDay: 15,
        name: "Valentine's Day",
        leftIcon: '💝',
        rightIcon: '🍫'
    },
    
    // ひな祭り（3/2～3/4）
    {
        startMonth: 3, startDay: 2,
        endMonth: 3, endDay: 4,
        name: 'Hinamatsuri',
        leftIcon: '🎎',
        rightIcon: '🌸'
    },
    
    // エイプリルフール（4/1）
    {
        startMonth: 4, startDay: 1,
        name: "April Fools' Day",
        leftIcon: '🤡',
        rightIcon: '🎭'
    },
    
    // イースター（4/4～4/6）
    {
        startMonth: 4, startDay: 4,
        endMonth: 4, endDay: 6,
        name: 'Easter',
        leftIcon: '🐰',
        rightIcon: '🥚'
    },
    
    // バラ/母の日（5/1～5/3）
    {
        startMonth: 5, startDay: 1,
        endMonth: 5, endDay: 3,
        name: "Mother's Day",
        leftIcon: '🌹',
        rightIcon: '💐'
    },
    
    // 父の日（6/15～6/17）
    {
        startMonth: 6, startDay: 15,
        endMonth: 6, endDay: 17,
        name: "Father's Day",
        leftIcon: '👔',
        rightIcon: '💼'
    },
    
    // 梅雨（6/28～6/30）
    {
        startMonth: 6, startDay: 28,
        endMonth: 6, endDay: 30,
        name: 'Rainy Season',
        leftIcon: '☔',
        rightIcon: '🐌'
    },
    
    // 七夕（7/6～7/8）
    {
        startMonth: 7, startDay: 6,
        endMonth: 7, endDay: 8,
        name: 'Tanabata',
        leftIcon: '🎋',
        rightIcon: '⭐'
    },
    
    // 花火/夏（8/29～8/31）
    {
        startMonth: 8, startDay: 29,
        endMonth: 8, endDay: 31,
        name: 'Summer Festival',
        leftIcon: '🎆',
        rightIcon: '🎇'
    },
    
    // お月見（9/28～9/30）
    {
        startMonth: 9, startDay: 28,
        endMonth: 9, endDay: 30,
        name: 'Moon Viewing',
        leftIcon: '🌕',
        rightIcon: '🐇'
    },
    
    // ハロウィン（10/29～10/31）
    {
        startMonth: 10, startDay: 29,
        endMonth: 10, endDay: 31,
        name: 'Halloween',
        leftIcon: '🎃',
        rightIcon: '👻'
    },
    
    // 峰野先生の誕生日（12/11）
    {
        startMonth: 12, startDay: 11,
        name: "Prof. Mineno's Birthday",
        leftIcon: '🎂',
        rightIcon: '🎉'
    },
];

// 日付文字列を比較用の数値に変換 (MMDD形式)
const dateToNumber = (month: number, day: number): number => {
    return month * 100 + day;
};

// 現在の日付に対応するイベントを取得する関数（期間対応）
export const getCurrentDateEvent = (date: Date): DateEvent | null => {
    const currentMonth = date.getMonth() + 1; // 0-11 → 1-12
    const currentDay = date.getDate();
    const currentDate = dateToNumber(currentMonth, currentDay);
    
    // イベントリストを逆順で検索（後に定義されたイベントが優先）
    for (let i = DATE_EVENTS.length - 1; i >= 0; i--) {
        const event = DATE_EVENTS[i];
        const startDate = dateToNumber(event.startMonth, event.startDay);
        
        // 単日イベントの場合
        if (event.endMonth === undefined || event.endDay === undefined) {
            if (currentDate === startDate) {
                return event;
            }
            continue;
        }
        
        const endDate = dateToNumber(event.endMonth, event.endDay);
        
        // 年をまたぐ期間の場合（例：12/31 - 1/6）
        if (startDate > endDate) {
            if (currentDate >= startDate || currentDate <= endDate) {
                return event;
            }
        }
        // 通常の期間の場合
        else {
            if (currentDate >= startDate && currentDate <= endDate) {
                return event;
            }
        }
    }

    return null;
};
