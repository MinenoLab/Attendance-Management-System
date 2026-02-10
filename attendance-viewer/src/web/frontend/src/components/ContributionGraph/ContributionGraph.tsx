import React from 'react';
import './ContributionGraph.css';

// コンポーネントのプロパティの型定義
interface ContributionGraphProps {
    userName : string;
    startDate: string; // 'YYYY-MM-DD' 形式
    endDate  : string; // 'YYYY-MM-DD' 形式
    dailyData: { [date: string]: number };
}

const MONTH_LABELS  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS_TO_SHOW = 53;

const getColorForTime = (minutes: number): string => {
    if (minutes > 480) return 'color-level-4'; // 8時間以上
    if (minutes > 360) return 'color-level-3'; // 6時間以上
    if (minutes > 240) return 'color-level-2'; // 4時間以上
    if (minutes > 120) return 'color-level-1'; // 2時間以上
    return 'color-level-0';                    // 2時間未満
};

// タイムゾーン問題を回避して 'YYYY-MM-DD' 形式の文字列を生成する関数
const toISODateString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const ContributionGraph: React.FC<ContributionGraphProps> = ({ startDate, endDate, dailyData, userName }) => {
    const getCalendarData = () => {
        const weeks: Date[][]                                         = [];
        const monthLabelPositions: { label: string; index: number }[] = [];
        
        // startDateを解析して開始日を取得
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        const firstDayOfPeriod = new Date(startYear, startMonth - 1, startDay);
        const dayOfWeek = firstDayOfPeriod.getDay();

        // 開始日の前の日曜日を計算
        const startDateObj = new Date(firstDayOfPeriod);
        startDateObj.setDate(firstDayOfPeriod.getDate() - dayOfWeek);
        
        // endDateを解析して終了日を取得
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
        const lastDayOfPeriod = new Date(endYear, endMonth - 1, endDay);
        
        let lastMonth = -1;

        for (let weekIndex = 0; weekIndex < WEEKS_TO_SHOW; weekIndex++) {
            const week: Date[] = [];
            for (let dayOfWeekIndex = 0; dayOfWeekIndex < 7; dayOfWeekIndex++) {
                const currentDate = new Date(startDateObj);
                currentDate.setDate(startDateObj.getDate() + weekIndex * 7 + dayOfWeekIndex);
                
                // 終了日を超えたら空のDateオブジェクトを追加
                if (currentDate > lastDayOfPeriod) {
                    week.push(new Date(NaN)); // 無効な日付として扱う
                } else {
                    week.push(currentDate);
                }
                
                const month = currentDate.getMonth();
                if (month !== lastMonth && dayOfWeekIndex === 0 && !isNaN(currentDate.getTime())) {
                    monthLabelPositions.push({ label: MONTH_LABELS[month], index: weekIndex });
                    lastMonth = month;
                }
            }
            weeks.push(week);
        }

        return { weeks, monthLabelPositions };
    };

    const { weeks, monthLabelPositions } = getCalendarData();

    return (
        <div className="graph-container-yearly">
            <h3 className="graph-title">{userName} - {startDate} 〜 {endDate}</h3>
            <div className="graph-grid">
                <div className="months-row">
                    {monthLabelPositions.map(({ label, index }) => (
                        <div key={label} className="month-label" style={{ gridColumnStart: index + 1 }}>
                            {label}
                        </div>
                    ))}
                </div>
                <div className="days-and-cells">
                    <div className="days-col">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </div>
                    <div className="cells-grid">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="week-col">
                                {week.map((date, dayIndex) => {
                                    // 無効な日付の場合は空のセルを表示
                                    if (isNaN(date.getTime())) {
                                        return <div key={dayIndex} className="cell empty" />;
                                    }

                                    // タイムゾーン問題を回避する関数を使用
                                    const dateString = toISODateString(date);
                                    const minutes    = dailyData[dateString] || 0;
                                    const colorClass = getColorForTime(minutes);
                                    const title      = `${dateString}\n滞在時間: ${minutes}分`;

                                    return <div key={dayIndex} className={`cell ${colorClass}`} title={title} />;
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="legend">
                <span>Less</span>
                    <div className="cell color-level-0"></div>
                    <div className="cell color-level-1"></div>
                    <div className="cell color-level-2"></div>
                    <div className="cell color-level-3"></div>
                    <div className="cell color-level-4"></div>
                <span>More</span>
            </div>
        </div>
    );
};

// 小さなインライン版のContributionGraphコンポーネント
interface MiniContributionGraphProps {
    attendanceData: { [date: string]: number };
    className?: string;
}

export const MiniContributionGraph: React.FC<MiniContributionGraphProps> = ({attendanceData, className = ''}) => {
    const getLast7Days = () => {
        const days = [];
        for (let i = 7; i >= 1; i--) { // 当日を除く、昨日から7日前まで
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const getIntensity = (hours: number) => {
        if (hours === 0) return 0;
        if (hours <= 2) return 1;
        if (hours <= 4) return 2;
        if (hours <= 6) return 3;
        return 4;
    };

    const last7Days = getLast7Days();

    return (
        <div className={`mini-contribution-graph ${className}`}>
            {last7Days.map((date) => {
                const hours = attendanceData[date] || 0;
                const intensity = getIntensity(hours);
                return (
                    <div
                        key={date}
                        className={`mini-day color-level-${intensity}`}
                        title={`${date}: ${hours.toFixed(1)}時間`}
                    />
                );
            })}
        </div>
    );
};

export default ContributionGraph;