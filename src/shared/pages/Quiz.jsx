import { IonPage } from "@ionic/react";
import React from "react";
import PageLayout from "../layout/PageLayout";
import { getThemeConfig } from "@/infrastructure/theme/themeConfig";
import { usePeriodPrediction } from "@/domains/health/hooks/usePeriodPrediction";

const Quiz = () => {
  const { currentPhase } = usePeriodPrediction();
  const isDuringMenstruation = currentPhase?.name === "Menstrual";
  const theme = getThemeConfig(isDuringMenstruation);

  return (
    <PageLayout >
      <div className={`flex justify-center items-center h-1/2`}>
        <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Quiz Page Coming Soon!</h1>
      </div>
    </PageLayout>
  );
};

export default Quiz;
