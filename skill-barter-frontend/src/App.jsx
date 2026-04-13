import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OfferSkill from './pages/OfferSkill';
import BrowseSkills from './pages/BrowseSkills';
import SearchSkills from './pages/SearchSkills';
import SkillMatches from './pages/SkillMatches';
import MatchDetails from './pages/MatchDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Route Guard for authenticated users
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userName');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container" style={{ padding: '2rem 0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offer" element={<PrivateRoute><OfferSkill /></PrivateRoute>} />
            <Route path="/browse" element={<BrowseSkills />} />
            <Route path="/search" element={<SearchSkills />} />
            <Route path="/matches" element={<PrivateRoute><SkillMatches /></PrivateRoute>} />
            <Route path="/collaboration/:matchId" element={<PrivateRoute><MatchDetails /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
