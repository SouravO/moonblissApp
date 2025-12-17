import { IonPage, IonContent } from "@ionic/react";

const AppShell = ({ children }) => (
  <IonPage>
    <IonContent fullscreen>{children}</IonContent>
  </IonPage>
);

export default AppShell;
