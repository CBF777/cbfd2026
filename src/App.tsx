import { useGameStore } from './store/gameStore';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import HomeScreen from './components/HomeScreen';
import PlayScreen from './components/PlayScreen';
import ProfileScreen from './components/ProfileScreen';
import RankingScreen from './components/RankingScreen';
import GameScreen from './components/GameScreen';
import MatchResultScreen from './components/MatchResultScreen';
import CustomRoomsScreen from './components/CustomRoomsScreen';
import RoomLobbyScreen from './components/RoomLobbyScreen';
import SettingsScreen from './components/SettingsScreen';

export default function App() {
  const currentScreen = useGameStore(s => s.currentScreen);
  
  switch (currentScreen) {
    case 'splash':
      return <SplashScreen />;
    case 'login':
      return <LoginScreen />;
    case 'register':
      return <RegisterScreen />;
    case 'home':
      return <HomeScreen />;
    case 'play':
      return <PlayScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'ranking':
      return <RankingScreen />;
    case 'game':
      return <GameScreen />;
    case 'matchResult':
      return <MatchResultScreen />;
    case 'customRooms':
      return <CustomRoomsScreen />;
    case 'roomLobby':
      return <RoomLobbyScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <SplashScreen />;
  }
}
