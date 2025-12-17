import {
  IonModal,
  IonContent,
  IonButton,
  IonInput,
  IonText,
} from "@ionic/react";
import { useState } from "react";
import { savePeriodData } from "@/infrastructure/storage/onboarding";
import {
  calculateNextPeriod,
  formatPeriodDate,
} from "@/domains/health/services/periodPredictor";

const PeriodSetupModal = ({ isOpen, onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [predictedDate, setPredictedDate] = useState(null);

  const handleDateSubmit = () => {
    if (lastPeriodDate) {
      setStep(2);
    }
  };

  const handleComplete = () => {
    const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength);
    setPredictedDate(nextPeriod);
    savePeriodData(lastPeriodDate, cycleLength);
    setStep(3);
  };

  const handleFinish = () => {
    onComplete();
    // Reset for next time
    setStep(1);
    setLastPeriodDate("");
    setCycleLength("28");
    setPredictedDate(null);
  };

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false}>
      <IonContent className="flex items-center justify-center">
        <div className="px-6 py-8 max-w-md w-full">
          {step === 1 && (
            <div className="text-center">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Track Your Cycle
              </h2>
              <p className="text-gray-600 mb-8">
                When did your last period start?
              </p>

              <IonInput
                type="date"
                value={lastPeriodDate}
                onIonInput={(e) => setLastPeriodDate(e.detail.value)}
                className="bg-gray-100 rounded-xl mb-6"
                style={{
                  "--background": "#f3f4f6",
                  "--padding-start": "1rem",
                  "--padding-end": "1rem",
                }}
              />

              <IonButton
                expand="block"
                onClick={handleDateSubmit}
                disabled={!lastPeriodDate}
                className="mb-3 h-12 rounded-xl font-semibold"
                style={{
                  "--background": "linear-gradient(to right, #ec4899, #a855f7)",
                }}
              >
                Continue
              </IonButton>

              <IonButton
                expand="block"
                fill="clear"
                onClick={onSkip}
                className="text-gray-500"
              >
                Skip for now
              </IonButton>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="text-6xl mb-6">⏱️</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Cycle Length
              </h2>
              <p className="text-gray-600 mb-8">
                How many days is your typical cycle?
              </p>

              <div className="mb-6">
                <IonInput
                  type="number"
                  value={cycleLength}
                  onIonInput={(e) => setCycleLength(e.detail.value)}
                  min="21"
                  max="35"
                  className="bg-gray-100 rounded-xl text-center text-3xl font-bold"
                  style={{
                    "--background": "#f3f4f6",
                    "--padding-start": "1rem",
                    "--padding-end": "1rem",
                  }}
                />
                <IonText className="text-sm text-gray-500 mt-2 block">
                  Usually between 21-35 days
                </IonText>
              </div>

              <IonButton
                expand="block"
                onClick={handleComplete}
                disabled={!cycleLength || cycleLength < 21 || cycleLength > 35}
                className="mb-3 h-12 rounded-xl font-semibold"
                style={{
                  "--background": "linear-gradient(to right, #ec4899, #a855f7)",
                }}
              >
                Calculate
              </IonButton>

              <IonButton
                expand="block"
                fill="clear"
                onClick={() => setStep(1)}
                className="text-gray-500"
              >
                Back
              </IonButton>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                All Set!
              </h2>
              <p className="text-gray-600 mb-6">
                Based on your cycle, your next period is predicted for:
              </p>

              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-8">
                <div className="text-3xl font-bold text-pink-600">
                  {formatPeriodDate(predictedDate)}
                </div>
              </div>

              <IonButton
                expand="block"
                onClick={handleFinish}
                className="h-12 rounded-xl font-semibold"
                style={{
                  "--background": "linear-gradient(to right, #ec4899, #a855f7)",
                }}
              >
                Get Started
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PeriodSetupModal;
