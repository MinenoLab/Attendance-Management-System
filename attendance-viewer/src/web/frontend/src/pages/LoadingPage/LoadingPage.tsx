import { useEffect }        from "react";
import { useNavigate }      from "react-router-dom";
import { useGetAttendance } from "../../hooks/useGetAttendance";
import { useGetUser }       from "../../hooks/useGetUser";
import './LoadingPage.css';

const LoadingPage = () => {
    const navigate = useNavigate();

    // useGetAttendanceフックを使用して、出席者のデータを取得
    // useGetUserフックを使用して、全ユーザーのデータを取得
    const { users: attendanceUsers, isLoading: isLoadingAttendance, error: attendanceError } = useGetAttendance();
    const { users: allUsers, isLoading: isLoadingAllUsers, error: allUsersError }            = useGetUser();

    useEffect(() => {
        // 読み込み状態を確認
        const isStillLoading = isLoadingAttendance || isLoadingAllUsers;
        if (isStillLoading) {
            return;
        }

        // エラーが発生した場合はエラーページにリダイレクト
        const combinedError = attendanceError || allUsersError;
        if (combinedError) {
            navigate("/error", {
                replace: true,
                state: { message: combinedError.message }
            });
            return;
        }

        // データが正常に取得できた場合は、/viewsページにリダイレクト
        if (attendanceUsers && allUsers) {
            navigate("/views", {
                replace: true,
                state: {
                    attendanceUsers: attendanceUsers,
                    allUsers       : allUsers
                }
            });
        }
    }, [
        isLoadingAttendance, isLoadingAllUsers,
        attendanceUsers, allUsers,
        attendanceError, allUsersError,
        navigate
    ]);

    return (
        <div className="loading-container">
            <h1>読み込み...</h1>
            <p>ページを準備しています</p>
            <div className="spinner" />
        </div>
    );
};

export default LoadingPage;