import "./App.css";
import Authenticated from "./screens/authenticated";
import { ErrorBoundary } from "react-error-boundary";
import Login from "./screens/login";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WalletProvider, useWallet } from "./context/WalletContext";

function AppContent() {
  const { isConnected } = useWallet();

  return (
    <ChatProvider>
      <SocketProvider>
        <ErrorBoundary fallback={<p>there was an error. please refresh.</p>}>
          <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {!isConnected && <Login />}
            {isConnected && <Authenticated />}
          </main>
        </ErrorBoundary>
      </SocketProvider>
    </ChatProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
