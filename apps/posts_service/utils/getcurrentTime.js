export const getCurrentWeek = () => {
    const currentDate = new Date();
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (currentDate - firstDayOfYear) / 86400000;
    const currentWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return currentWeek;
};

export const getCurrentYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    return currentYear;
};

export const getCurrentTime = () => {
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();
    return currentTime;
};