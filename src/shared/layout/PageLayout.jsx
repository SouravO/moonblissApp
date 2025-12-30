import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/react";

const PageLayout = ({ title, children }) => {
  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{
          "--background": "#ffffffff", // blue
          "--padding-bottom": "calc(70px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </IonContent>
    </IonPage>
  );
};

export default PageLayout;
