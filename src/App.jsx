import AppRouter from "@/app/router";
import { BackButtonProvider } from "@/infrastructure/context/BackButtonContext";

const App = () => {
  return (
    <BackButtonProvider>
      <AppRouter />
    </BackButtonProvider>
  );
};

export default App;
