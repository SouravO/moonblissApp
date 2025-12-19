import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";

const Profile = () => {
  const userData = getUserData();
  const userName = userData.name || "User";
  const userAge =
    userData.age || userData.dateOfBirth
      ? userData.age || calculateAge(userData.dateOfBirth)
      : null;

  // Calculate age from date of birth
  function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  return (
    <PageLayout title="Profile">
      <div className="flex flex-col items-center pt-6">
        {/* Profile GIF */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg mb-4">
          <img
            src="/images/product/girl.gif"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{userName}</h1>

        {/* Age */}
        {userAge && (
          <p className="text-gray-500 text-lg mb-6">{userAge} years old</p>
        )}

        {/* Profile Info Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Profile Info
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-800">{userName}</span>
            </div>

            {userAge && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Age</span>
                <span className="font-medium text-gray-800">{userAge}</span>
              </div>
            )}

            {userData.email && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-800">
                  {userData.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Settings placeholder */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings</h2>
          <p className="text-gray-500 text-center py-4">
            More settings coming soon
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
