import PageLayout from "@/shared/layout/PageLayout";

const Profile = () => {
  return (
    <PageLayout title="Profile">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-6">
          <span className="text-4xl text-white">👤</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-600 text-center">Profile content coming soon</p>
      </div>
    </PageLayout>
  );
};

export default Profile;
