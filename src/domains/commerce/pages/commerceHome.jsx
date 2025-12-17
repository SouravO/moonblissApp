import PageLayout from "@/shared/layout/PageLayout";

const CommerceHome = () => {
  return (
    <PageLayout title="Store">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">🛍️</div>
        <h1 className="text-2xl font-bold mb-4">Moonbliss Store</h1>
        <p className="text-gray-600 text-center">
          Wellness products coming soon
        </p>
      </div>
    </PageLayout>
  );
};

export default CommerceHome;
