// APIやWebSocketから送られてくるステータスの種類
export type UserStatus = 'clock_in' | 'clock_out' | 'break_in' | 'break_out';
// ユーザー情報APIが返すユーザー情報の型
export interface User {
    name  : string;
    status: UserStatus;
}
// ユーザー識別子APIが返すユーザー情報の型
export interface UserIdentifier {
    name :string;
    grade: string;
}
// ユーザー情報をフルに含む型 (学年とステータスを含む)
export interface FullUserInfo {
    name  : string;
    grade : string;
    status: UserStatus;
}
// useGetAttendanceフックが返す値の型
export interface UseGetAttendanceReturn {
    users    : User[] | null;
    isLoading: boolean;
    error    : Error | null;
}
// APIから返されるスナップショットデータの型
export type SnapshotData = {
    [userName: string]: {
        [date: string]: number;
    };
};
// useGetSnapshotフックの返り値の型
export type UseGetSnapshotReturn = {
    snapshotData: SnapshotData | null;
    isLoading   : boolean;
    error       : Error | null;
};
// useGetUserフックが返す値の型
export interface UseGetUserReturn {
    users    : UserIdentifier[] | null;
    isLoading: boolean;
    error    : Error | null;
}
// useAttendanceSocketフックが返す値の型
export interface UseAttendanceSocketReturn {
    users: FullUserInfo[];
    error: Error | null;
}
// useUpdateAttendanceAdminフックが返す値の型
export interface UseUpdateAttendanceAdminReturn {
    updateAttendance: (name: string, status: UserStatus) => Promise<void>;
    isLoading: boolean;
    error    : Error | null;
    isSuccess: boolean;
}

// 過去7日間のデータの型
export type Last7DaysData = {
    [userId: string]: {
        [date: string]: number;
    };
};

// useGetLast7DaysAttendanceフックが返す値の型
export interface UseGetLast7DaysAttendanceReturn {
    last7DaysData: Last7DaysData;
    isLoading    : boolean;
    error        : Error | null;
}