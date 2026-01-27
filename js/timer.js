const Timer = (function() {
    let interval = null;
    let startDate = null;
    let onUpdate = null;

    function init(date, callback) {
        startDate = new Date(date);
        onUpdate = callback;
        if (interval) clearInterval(interval);
        update();
        interval = setInterval(update, 1000);
    }

    function update() {
        if (!startDate) return;
        const now = new Date();
        const diff = now - startDate;
        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const totalSeconds = Math.floor(diff / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        
        const years = now.getFullYear() - startDate.getFullYear();
        const months = now.getMonth() - startDate.getMonth() + years * 12;
        const days = totalDays % 30;

        const data = { years, months, days, hours, minutes, seconds, totalDays };
        if (onUpdate) onUpdate(data);
    }

    function getNextAnniversary(dateStr) {
        const today = new Date();
        const anniversary = new Date(dateStr);
        const year = anniversary < today ? today.getFullYear() + 1 : today.getFullYear();
        const nextDate = new Date(year, anniversary.getMonth(), anniversary.getDate());
        const diff = nextDate - today;
        return { date: nextDate, daysUntil: Math.ceil(diff / (1000 * 60 * 60 * 24)) };
    }

    function destroy() {
        if (interval) clearInterval(interval);
    }

    return { init, update, getNextAnniversary, destroy };
})();
