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
      <IonHeader>
        <IonToolbar
          className="flex justify-center"
          style={{ paddingTop: "env(safe-area-inset-top, 20px)" }}
        >
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="ion-padding"
        style={{
          "--padding-bottom": "calc(70px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {children}
      </IonContent>
    </IonPage>
  );
};

export default PageLayout;
