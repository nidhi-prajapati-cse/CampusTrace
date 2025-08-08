import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ViewItems from './pages/ViewItems';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import { ChatProvider } from "./context/ChatContext";
import { AuthProvider } from "./context/AuthContext"; 
import ChatFloatingButton from "./components/ChatFloatingButton";

function App() {
  return (
    <AuthProvider>          
      <ChatProvider>        
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/view-items" element={<ViewItems />} />
            <Route path="/admindash" element={<AdminDashboard />} />
            <Route path="/userdash" element={<UserDashboard />} />
          </Routes>
          <ChatFloatingButton />
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
