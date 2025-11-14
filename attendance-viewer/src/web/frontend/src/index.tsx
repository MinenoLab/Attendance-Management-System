import React           from 'react';
import ReactDOM        from 'react-dom/client';
import App             from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify }     from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './index.css';

// AWS Amplifyの設定を行う
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId      : process.env.REACT_APP_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || ''
    }
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
