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
      <IonHeader  >
        <IonToolbar className="flex justify-center justify-center pt-5">
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">{children}</IonContent>
    </IonPage>
  );
};

export default PageLayout;
