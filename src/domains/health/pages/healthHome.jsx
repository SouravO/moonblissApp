import PageLayout from "@/shared/layout/PageLayout";
import PeriodTracker from "@/domains/health/components/PeriodTracker";
import { getUserData } from "@/infrastructure/storage/onboarding";

const HealthHome = () => {
  const userData = getUserData();
  const userName = userData.name || "there";

  return (
    <PageLayout title="Health">
      <div className="flex flex-col h-full">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600">Track your wellness journey</p>
        </div>

        {/* Period Tracker Widget */}
        <div className="mb-6">
          <PeriodTracker />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-2">💧</div>
            <p className="text-sm text-gray-600 mb-1">Water Intake</p>
            <p className="text-xl font-bold text-gray-800">0 / 8</p>
            <p className="text-xs text-gray-500">glasses today</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-2">😴</div>
            <p className="text-sm text-gray-600 mb-1">Sleep</p>
            <p className="text-xl font-bold text-gray-800">0h</p>
            <p className="text-xs text-gray-500">last night</p>
          </div>
        </div>

        {/* Wellness Tips */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Wellness Tip</h3>
              <p className="text-sm text-gray-600">
                Stay hydrated! Drinking enough water helps regulate your cycle
                and reduces cramps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HealthHome;
