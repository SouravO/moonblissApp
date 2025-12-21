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
        style={{
          "--padding-bottom": "calc(70px + env(safe-area-inset-bottom, 0px))",
          "--padding-left": "0",
          "--padding-right": "0",
          "--padding-top": "0",
        }}
      >
        {children}
      </IonContent>
    </IonPage>
  );
};

export default PageLayout;
