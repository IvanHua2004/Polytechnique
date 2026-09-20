import { BrowserRouter as Router, Routes, Route } from 'react-router';
import PostPage from './pages/postPage';
import HomePage from './pages/homePage';
import { Provider } from './contexts/provider';
import Header from './components/header';
import ModalProvider from './contexts/modalProvider';
import LoginComponent from './components/loginComponent.jsx';

function App() {
  return (
    <>
      <Provider>
        <ModalProvider element={<LoginComponent />}>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="post/:postId" element={<PostPage />} />
            </Routes>
          </Router>
        </ModalProvider>
      </Provider>
    </>
  );
}

export default App;
