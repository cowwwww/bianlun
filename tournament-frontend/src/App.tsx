import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import TournamentDetail from './pages/TournamentDetail';
import CreateTournament from './pages/CreateTournament';
import ProfilePage from './pages/Profile';
import MUNTournaments from './pages/MUNTournaments';
import HackathonTournaments from './pages/HackathonTournaments';
import DebateTournaments from './pages/DebateTournaments';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Resources from './pages/Resources';
import AddResource from './pages/AddResource';
import ProjectList from './pages/ProjectList';
import CreateProject from './pages/CreateProject';
import RunTimer from './pages/RunTimer';
import JudgeProfile from './pages/JudgeProfile';
import JudgeList from './pages/Judgelist';
import JudgeDetail from './pages/JudgeDetail';
import TopicList from './pages/TopicList';
import AddTopic from './pages/AddTopic';
import RegisterTournament from './pages/RegisterTournament';
import MatchScorePage from './pages/MatchScorePage';
import MyMatches from './pages/MyMatches';
import ManageMatches from './pages/ManageMatches';
import TimerIntroduction from './pages/TimerIntroduction';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import TournamentOrganizer from './pages/TournamentOrganizer';
import WeChatLogin from './pages/WeChatLogin';
import WeChatCallback from './pages/WeChatCallback';
import TournamentBracket from './pages/TournamentBracket';
import RegistrationManagement from './pages/RegistrationManagement';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/tournaments/:id/register" element={<RegisterTournament />} />
            <Route path="/create-tournament" element={<CreateTournament />} />
            <Route path="/matches/:matchId/score" element={<MatchScorePage />} />
            <Route path="/my-matches" element={<MyMatches />} />
            <Route path="/tournaments/:id/manage-matches" element={<ManageMatches />} />
            <Route path="/organizer/tournaments/:id/registrations" element={<RegistrationManagement />} />
            <Route path="/organizer/tournaments/:id/bracket" element={<TournamentBracket />} />
            <Route path="/registration-management" element={<RegistrationManagement />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tournaments/mun" element={<MUNTournaments />} />
            <Route path="/tournaments/hackathon" element={<HackathonTournaments />} />
            <Route path="/tournaments/debate" element={<DebateTournaments />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/addresource" element={<AddResource />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/run-timer/:id" element={<RunTimer />} />
            <Route path="/judge-profile" element={<JudgeProfile />} />
            <Route path="/judge" element={<JudgeList />} />
            <Route path="/judge-detail/:id" element={<JudgeDetail />} />
            <Route path="/topics" element={<TopicList />} />
            <Route path="/add-topic" element={<AddTopic />} />
            <Route path="/timer-introduction" element={<TimerIntroduction />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/tournament-organizer" element={<TournamentOrganizer />} />
            <Route path="/auth/wechat/login" element={<WeChatLogin />} />
            <Route path="/auth/wechat/callback" element={<WeChatCallback />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
