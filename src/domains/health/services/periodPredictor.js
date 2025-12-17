export const calculateNextPeriod = (lastPeriodDate, cycleLength) => {
    if (!lastPeriodDate || !cycleLength) return null;

    const lastDate = new Date(lastPeriodDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + parseInt(cycleLength));

    return nextDate.toISOString().split('T')[0];
};

export const getDaysUntilNextPeriod = (lastPeriodDate, cycleLength) => {
    const nextPeriod = calculateNextPeriod(lastPeriodDate, cycleLength);
    if (!nextPeriod) return null;

    const today = new Date();
    const next = new Date(nextPeriod);
    const diffTime = next - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

export const formatPeriodDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};
