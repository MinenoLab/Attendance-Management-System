// 日付イベントの型定義
export interface DateEvent {
    startMonth: number;  // 1-12
    startDay: number;
    endMonth?: number;   // オプション。指定しない場合は単日イベント
    endDay?: number;     // オプション。指定しない場合は単日イベント
    colorClass: string;
    name: string;
    description?: string;
}

// イベントカレンダー定義
export const DATE_EVENTS: DateEvent[] = [
    // クリスマス（12/23-25）
    { 
        startMonth: 12, startDay: 23, 
        endMonth: 12, endDay: 25, 
        colorClass: 'event-christmas', 
        name: '🎄 Merry Christmas',
        description: 'クリスマス'
    },
    
    // 正月（12/31-1/6）
    { 
        startMonth: 12, startDay: 31, 
        endMonth: 1, endDay: 6, 
        colorClass: 'event-newyear', 
        name: '🎍 Happy New Year',
        description: '新年'
    },
    
    // 節分（2/2-4）
    { 
        startMonth: 2, startDay: 2, 
        endMonth: 2, endDay: 4, 
        colorClass: 'event-setsubun', 
        name: '👹 節分',
        description: '節分'
    },
    
    // バレンタイン（2/13-15）
    { 
        startMonth: 2, startDay: 13, 
        endMonth: 2, endDay: 15, 
        colorClass: 'event-valentine', 
        name: '💝 Happy Valentine',
        description: 'バレンタイン'
    },
    
    // ひな祭り（3/2-4）
    { 
        startMonth: 3, startDay: 2, 
        endMonth: 3, endDay: 4, 
        colorClass: 'event-hinamatsuri', 
        name: '🎎 ひな祭り',
        description: 'ひな祭り'
    },
    
    // 桜（3/15-31）
    { 
        startMonth: 3, startDay: 15, 
        endMonth: 3, endDay: 31, 
        colorClass: 'event-sakura', 
        name: '🌸 Cherry Blossom Season',
        description: '桜の季節'
    },
    
    // エイプリルフール（4/1）
    { 
        startMonth: 4, startDay: 1, 
        colorClass: 'event-april-fool', 
        name: '🤡 ƨ⅃ooꟻ ⅃iɿqA',
        description: 'エイプリルフール'
    },
    
    // バラ・母の日（5/1-3）
    { 
        startMonth: 5, startDay: 1, 
        endMonth: 5, endDay: 3, 
        colorClass: 'event-rose', 
        name: '🌹 Mother\'s Day Week',
        description: '母の日ウィーク'
    },
    
    // 梅雨（6/15-30）
    { 
        startMonth: 6, startDay: 15, 
        endMonth: 6, endDay: 30, 
        colorClass: 'event-rainy', 
        name: '☔ Rainy Season',
        description: '梅雨'
    },
    
    // 七夕（7/6-8）
    { 
        startMonth: 7, startDay: 6, 
        endMonth: 7, endDay: 8, 
        colorClass: 'event-tanabata', 
        name: '🎋 七夕',
        description: '七夕'
    },
    
    // 花火・夏（8/15-31）
    { 
        startMonth: 8, startDay: 15, 
        endMonth: 8, endDay: 31, 
        colorClass: 'event-fireworks', 
        name: '🎆 Summer Festival',
        description: '夏祭り'
    },
    
    // お月見（9/28-30）
    { 
        startMonth: 9, startDay: 28, 
        endMonth: 9, endDay: 30, 
        colorClass: 'event-tsukimi', 
        name: '🌕 お月見',
        description: '中秋の名月'
    },
    
    // ハロウィン（10/29-31）
    { 
        startMonth: 10, startDay: 29, 
        endMonth: 10, endDay: 31, 
        colorClass: 'event-halloween', 
        name: '🎃 Happy Halloween',
        description: 'ハロウィン'
    },
    
    // 紅葉（11/3-5）
    { 
        startMonth: 11, startDay: 3, 
        endMonth: 11, endDay: 5, 
        colorClass: 'event-autumn', 
        name: '🍁 紅葉',
        description: '紅葉の季節'
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
