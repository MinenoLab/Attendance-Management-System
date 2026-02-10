// 日付イベントの型定義
export interface DateEvent {
    startMonth: number;  // 1-12
    startDay: number;
    endMonth?: number;   // オプション。指定しない場合は単日イベント
    endDay?: number;     // オプション。指定しない場合は単日イベント
    name: string;
    leftIcon: string;    // 左側のアイコン（絵文字）
    rightIcon: string;   // 右側のアイコン（絵文字）
}

// イベントカレンダー定義
export const DATE_EVENTS: DateEvent[] = [
    // クリスマス（12/23～25）
    { 
        startMonth: 12, startDay: 23, 
        endMonth: 12, endDay: 25, 
        name: 'クリスマス',
        leftIcon: '🎄',
        rightIcon: '🎅'
    },
    
    // 正月（12/31～1/6）
    { 
        startMonth: 12, startDay: 31, 
        endMonth: 1, endDay: 6, 
        name: 'お正月',
        leftIcon: '🎍',
        rightIcon: '🐉'
    },
    
    // 節分（2/2～2/4）
    { 
        startMonth: 2, startDay: 2, 
        endMonth: 2, endDay: 4, 
        name: '節分',
        leftIcon: '👹',
        rightIcon: '🫘'
    },
    
    // バレンタイン（2/13～2/15）
    { 
        startMonth: 2, startDay: 13, 
        endMonth: 2, endDay: 15, 
        name: 'バレンタイン',
        leftIcon: '💝',
        rightIcon: '🍫'
    },
    
    // ひな祭り（3/2～3/4）
    { 
        startMonth: 3, startDay: 2, 
        endMonth: 3, endDay: 4, 
        name: 'ひな祭り',
        leftIcon: '🎎',
        rightIcon: '🌸'
    },
    
    // 桜（3/15～3/31）
    { 
        startMonth: 3, startDay: 15, 
        endMonth: 3, endDay: 31, 
        name: '桜の季節',
        leftIcon: '🌸',
        rightIcon: '🌸'
    },
    
    // エイプリルフール（4/1）
    { 
        startMonth: 4, startDay: 1,
        name: 'エイプリルフール',
        leftIcon: '🤡',
        rightIcon: '🎭'
    },
    
    // バラ/母の日（5/1～5/3）
    { 
        startMonth: 5, startDay: 1, 
        endMonth: 5, endDay: 3, 
        name: '母の日',
        leftIcon: '🌹',
        rightIcon: '💐'
    },
    
    // 梅雨（6/15～6/30）
    { 
        startMonth: 6, startDay: 15, 
        endMonth: 6, endDay: 30, 
        name: '梅雨',
        leftIcon: '☔',
        rightIcon: '🐌'
    },
    
    // 七夕（7/6～7/8）
    { 
        startMonth: 7, startDay: 6, 
        endMonth: 7, endDay: 8, 
        name: '七夕',
        leftIcon: '🎋',
        rightIcon: '⭐'
    },
    
    // 花火/夏（8/15～8/31）
    { 
        startMonth: 8, startDay: 15, 
        endMonth: 8, endDay: 31, 
        name: '夏祭り',
        leftIcon: '🎆',
        rightIcon: '🎇'
    },
    
    // お月見（9/28～9/30）
    { 
        startMonth: 9, startDay: 28, 
        endMonth: 9, endDay: 30, 
        name: 'お月見',
        leftIcon: '🌕',
        rightIcon: '🐇'
    },
    
    // ハロウィン（10/29～10/31）
    { 
        startMonth: 10, startDay: 29, 
        endMonth: 10, endDay: 31, 
        name: 'ハロウィン',
        leftIcon: '🎃',
        rightIcon: '👻'
    },
    
    // 紅葉（11/3～11/5）
    { 
        startMonth: 11, startDay: 3, 
        endMonth: 11, endDay: 5, 
        name: '紅葉',
        leftIcon: '🍁',
        rightIcon: '🍂'
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
