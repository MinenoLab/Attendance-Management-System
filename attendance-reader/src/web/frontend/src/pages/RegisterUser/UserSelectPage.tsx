import { useState }    from 'react';
import { useNavigate } from 'react-router-dom';
import './UserSelectPage.css';

// ユーザー名選択ページ（日本語＋英語）
const UserSelectPage = () => {
	const navigate = useNavigate();
	const [selectedName, setSelectedName] 	= useState('');
	const [selectedGrade, setSelectedGrade] = useState('');

	// 環境変数から名前リストを取得
	const nameList = process.env.REACT_APP_USER_NAMES
		? process.env.REACT_APP_USER_NAMES.split(',')
		: [];

	// 環境変数から学年リストを取得
	const gradeList = process.env.REACT_APP_GRADES
		? process.env.REACT_APP_GRADES.split(',')
		: [];

	// 選択された名前と学年がある場合、次のページに遷移
	const handleNextClick = () => {
		if (!selectedName) return;
		navigate('/register-user/waiting', {
			state: { name: selectedName, grade: selectedGrade }
		});
	};

	// キャンセルボタンのクリック処理
	const handleCancel = () => {
		navigate('/');
	};

	return (
		<div id="user-name-select-page">
			<h2>
				ユーザー名を選択
				<br />
				<small>Select your name</small>
			</h2>

			<select onChange={(e) => setSelectedName(e.target.value)} value={selectedName}>
				<option value="">-- 選択してください / Please select --</option>
				{ nameList.map((name, index) => (
					<option key={index} value={name}>{name}</option>
				)) }
			</select>

			<h2>
				学年を選択
				<br />
				<small>Select your grade</small>
			</h2>

			<select onChange={(e) => setSelectedGrade(e.target.value)} value={selectedGrade}>
				<option value="">-- 選択してください / Please select --</option>
				{ gradeList.map((grade, index) => (
					<option key={index} value={grade}>{grade}</option>
				)) }
			</select>

			<div style={{ marginTop: '1rem' }}>
				<button onClick={handleNextClick} disabled={!selectedName || !selectedGrade}>
					次へ / Next
				</button>
			</div>

			<div style={{ marginTop: '1rem' }}>
				<button onClick={handleCancel}>
					中断 / Cancel
				</button>
			</div>
		</div>
	);
};

export default UserSelectPage;
