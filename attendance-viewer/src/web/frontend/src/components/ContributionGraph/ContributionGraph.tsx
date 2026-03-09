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
//const WEEKS_TO_SHOW = 53;

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

        // 終了日の次の土曜日を計算（カレンダーの描画終了地点）
        const endDayOfWeek = lastDayOfPeriod.getDay();
        const endDateObj = new Date(lastDayOfPeriod);
        endDateObj.setDate(lastDayOfPeriod.getDate() + (6 - endDayOfWeek));

        // 開始日から終了日までの正確な総日数を計算し、必要な「週数」を動的に割り出し
        const totalDays = Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dynamicWeeksToShow = Math.max(1, Math.floor(totalDays / 7));
        
        let lastMonth = -1;

        for (let weekIndex = 0; weekIndex < dynamicWeeksToShow; weekIndex++) {
            const week: Date[] = [];
            for (let dayOfWeekIndex = 0; dayOfWeekIndex < 7; dayOfWeekIndex++) {
                const currentDate = new Date(startDateObj);
                currentDate.setDate(startDateObj.getDate() + weekIndex * 7 + dayOfWeekIndex);
                
                // 期間外（開始日より前または終了日より後）なら空のDateオブジェクトを追加
                if (currentDate < firstDayOfPeriod || currentDate > lastDayOfPeriod) {
                    week.push(new Date(NaN)); // 無効な日付として扱う
                } else {
                    week.push(currentDate);
                }
                
                const month = currentDate.getMonth();
                // 期間内の日付で、かつ週の最初の日（日曜日）で月が変わった場合にラベルを追加
                if (month !== lastMonth && dayOfWeekIndex === 0 && 
                    currentDate >= firstDayOfPeriod && currentDate <= lastDayOfPeriod) {
                    monthLabelPositions.push({ label: MONTH_LABELS[month], index: weekIndex });
                    lastMonth = month;
                }
            }
            weeks.push(week);
        }

        return { weeks, monthLabelPositions };
    };

    const { weeks, monthLabelPositions } = getCalendarData();

    // 週の数に合わせて列を動的に生成し、最小幅（15px）を強制
    const dynamicGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `repeat(${weeks.length}, minmax(15px, 1fr))`
    };

    return (
        // overflowX と padding を追加し、グラフ自体がコンポーネント内で安全にスクロールできるようにします
        <div className="graph-container-yearly" style={{ overflowX: 'auto', padding: '16px 8px' }}>
            {/* 見出しはスクロールしても左端に残るように sticky を設定 */}
            <h3 className="graph-title" style={{ position: 'sticky', left: '0' }}>{userName} - {startDate} 〜 {endDate}</h3>
            
            {/* minWidth: 'max-content' を指定し、中身が強制的に圧縮されるのを防ぐ */}
            <div className="graph-grid" style={{ minWidth: 'max-content', padding: '8px 0' }}>
                {/* 動的生成したグリッドスタイルを適用 */}
                <div className="months-row" style={dynamicGridStyle}>
                    {monthLabelPositions.map(({ label, index }) => (
                        // overflow: 'visible' で月の文字が見切れないように保護
                        <div key={label} className="month-label" style={{ gridColumnStart: index + 1, overflow: 'visible' }}>
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