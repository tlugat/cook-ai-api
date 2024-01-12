export const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 0 && month <= 2) return 'Hiver';
    if (month >= 3 && month <= 5) return 'Printemps';
    if (month >= 6 && month <= 8) return 'Été';
    if (month >= 9 && month <= 11) return 'Automne';
};
