import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";

const Landing = () => {
  const history = useHistory();

  useEffect(() => {
    const timer = setTimeout(() => {
      history.push("/health");
    }, 2000);

    return () => clearTimeout(timer);
  }, [history]);

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400"
      >
        <div className="flex flex-col items-center justify-center w-full h-full px-6">
          <div className="flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-white shadow-2xl">
            <div className="text-6xl">🌙</div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 text-center tracking-tight">
            Moonbliss
          </h1>
          <p className="text-xl text-white/90 text-center font-light">
            Your wellness companion
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
