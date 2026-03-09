import React from 'react';
import './ContributionGraph.css';

interface ContributionGraphProps {
    userName : string;
    startDate: string; // 'YYYY-MM-DD' 形式
    endDate  : string; // 'YYYY-MM-DD' 形式
    dailyData: { [date: string]: number };
}

const MONTH_LABELS  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getColorForTime = (minutes: number): string => {
    if (minutes > 480) return 'color-level-4'; // 8時間以上
    if (minutes > 360) return 'color-level-3'; // 6時間以上
    if (minutes > 240) return 'color-level-2'; // 4時間以上
    if (minutes > 120) return 'color-level-1'; // 2時間以上
    return 'color-level-0';                    // 2時間未満
};

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
        
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        const firstDayOfPeriod = new Date(startYear, startMonth - 1, startDay);
        
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
        const lastDayOfPeriod = new Date(endYear, endMonth - 1, endDay);
        
        // カレンダーの描画開始位置（最初の日曜日）
        const startDateObj = new Date(firstDayOfPeriod);
        startDateObj.setDate(firstDayOfPeriod.getDate() - firstDayOfPeriod.getDay());
        
        // カレンダーの描画終了位置（最後の土曜日）
        const endDateObj = new Date(lastDayOfPeriod);
        endDateObj.setDate(lastDayOfPeriod.getDate() + (6 - lastDayOfPeriod.getDay()));

        let currentDate = new Date(startDateObj);
        let currentWeek: Date[] = Array(7).fill(new Date(NaN)); // 空の1週間（7マス）を用意
        let lastMonth = -1;

        // 1日ずつループしてカレンダーを組み立てる
        while (currentDate <= endDateObj) {
            const dayOfWeek   = currentDate.getDay();
            const month       = currentDate.getMonth();
            const dateNum     = currentDate.getDate();
            const isValidDate = currentDate >= firstDayOfPeriod && currentDate <= lastDayOfPeriod;
            
            // 現在の列にすでにデータが入っているかチェック
            const hasDataInCurrentWeek = currentWeek.some(d => !isNaN(d.getTime()));

            // 【UI改善の核心部分】
            // 期間内の有効な日付で、新しい月の「1日」であり、かつ週の途中（日曜日以外）の場合
            // 前の月のデータが入っている列を強制的に終了し、新しく右にズラした列を用意する
            if (isValidDate && dateNum === 1 && dayOfWeek !== 0 && hasDataInCurrentWeek) {
                weeks.push([...currentWeek]);
                currentWeek = Array(7).fill(new Date(NaN));
            }

            // ラベルの配置判定
            if (isValidDate && month !== lastMonth) {
                // 新しい月が始まったら、次に配置される列のインデックスにラベルを登録
                monthLabelPositions.push({ label: MONTH_LABELS[month], index: weeks.length });
                lastMonth = month;
            }

            // 期間内の日付なら、現在の週の該当曜日の位置にセット
            if (isValidDate) {
                currentWeek[dayOfWeek] = new Date(currentDate);
            }

            // 土曜日まできたら、その列を確定させて次の列へ
            if (dayOfWeek === 6) {
                weeks.push([...currentWeek]);
                currentWeek = Array(7).fill(new Date(NaN));
            }

            // 翌日へ進む
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // ループ終了後、まだ確定されていないデータが残っていれば追加
        if (currentWeek.some(d => !isNaN(d.getTime()))) {
            weeks.push([...currentWeek]);
        }

        return { weeks, monthLabelPositions };
    };

    const { weeks, monthLabelPositions } = getCalendarData();

    return (
        <div className="graph-container-yearly" style={{ overflowX: 'auto', paddingBottom: '16px' }}>
            <h3 className="graph-title" style={{ position: 'sticky', left: 0, zIndex: 2, backgroundColor: '#fff' }}>{userName} - {startDate} 〜 {endDate}</h3>
            <div className="graph-grid" style={{ minWidth: 'max-content', paddingRight: '24px' }}>
                <div className="months-row" style={{ position: 'relative', height: '20px' }}>
                    {monthLabelPositions.map(({ label, index }) => (
                        <div key={label} className="month-label" style={{ position: 'absolute', top: 0, left: `${index * 19}px` }}>
                            {label}
                        </div>
                    ))}
                </div>
                <div className="days-and-cells">
                    <div className="days-col" style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1 }}>
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
                                    if (isNaN(date.getTime())) {
                                        return <div key={dayIndex} className="cell empty" />;
                                    }

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
            <div className="legend" style={{ position: 'sticky', left: 0, marginTop: '8px' }}>
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

interface MiniContributionGraphProps {
    attendanceData: { [date: string]: number };
    className?: string;
}

export const MiniContributionGraph: React.FC<MiniContributionGraphProps> = ({attendanceData, className = ''}) => {
    const getLast7Days = () => {
        const days = [];
        for (let i = 7; i >= 1; i--) { 
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