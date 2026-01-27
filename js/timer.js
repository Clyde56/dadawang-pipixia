/**
 * 恋爱计时器模块
 * 负责计算和显示恋爱时长
 */

const Timer = (function() {
    let timerInterval = null;
    let startDate = null;
    let callbacks = {
        onUpdate: null
    };

    /**
     * 初始化计时器
     * @param {Date|string} date - 恋爱开始日期
     * @param {Function} onUpdate - 更新回调函数
     */
    function init(date, onUpdate) {
        if (onUpdate) {
            callbacks.onUpdate = onUpdate;
        }
        
        if (typeof date === 'string') {
            startDate = new Date(date);
        } else if (date instanceof Date) {
            startDate = date;
        }
        
        if (!startDate || isNaN(startDate.getTime())) {
            console.error('无效的日期格式');
            return false;
        }
        
        // 立即更新一次
        update();
        
        // 启动定时器
        start();
        
        return true;
    }

    /**
     * 启动计时器
     */
    function start() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerInterval = setInterval(update, 1000);
    }

    /**
     * 停止计时器
     */
    function stop() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    /**
     * 更新计时显示
     */
    function update() {
        if (!startDate) return;
        
        const now = new Date();
        const diff = now - startDate;
        
        // 计算各个时间单位
        const totalSeconds = Math.floor(diff / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        
        // 计算年月日
        const years = calculateYears(startDate, now);
        const months = calculateMonths(startDate, now);
        const days = totalDays % 30; // 简化的天数计算
        
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;
        
        const timeData = {
            years,
            months,
            days: totalDays,
            hours,
            minutes,
            seconds,
            totalDays,
            totalSeconds
        };
        
        // 调用回调函数
        if (callbacks.onUpdate) {
            callbacks.onUpdate(timeData);
        }
        
        return timeData;
    }

    /**
     * 计算完整年数
     */
    function calculateYears(start, end) {
        let years = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
        const dayDiff = end.getDate() - start.getDate();
        
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            years--;
        }
        
        return Math.max(0, years);
    }

    /**
     * 计算完整月数
     */
    function calculateMonths(start, end) {
        let months = (end.getFullYear() - start.getFullYear()) * 12;
        months += end.getMonth() - start.getMonth();
        const dayDiff = end.getDate() - start.getDate();
        
        if (dayDiff < 0) {
            months--;
        }
        
        return Math.max(0, months % 12);
    }

    /**
     * 获取总天数
     */
    function getTotalDays() {
        if (!startDate) return 0;
        const now = new Date();
        const diff = now - startDate;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * 获取开始日期
     */
    function getStartDate() {
        return startDate;
    }

    /**
     * 设置开始日期
     */
    function setStartDate(date) {
        if (typeof date === 'string') {
            startDate = new Date(date);
        } else if (date instanceof Date) {
            startDate = date;
        }
        update();
    }

    /**
     * 格式化时间差为友好显示
     */
    function formatTimeDiff(diffMs) {
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}天${hours % 24}小时`;
        }
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        }
        if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        }
        return `${seconds}秒`;
    }

    /**
     * 获取下次纪念日信息
     */
    function getNextAnniversary(anniversaryDate) {
        if (!startDate) return null;
        
        const today = new Date();
        const anniversary = new Date(anniversaryDate);
        const thisYear = anniversary.getMonth() < today.getMonth() || 
                        (anniversary.getMonth() === today.getMonth() && anniversary.getDate() < today.getDate())
                        ? today.getFullYear() + 1
                        : today.getFullYear();
        
        const nextAnniversary = new Date(thisYear, anniversary.getMonth(), anniversary.getDate());
        const diff = nextAnniversary - today;
        
        return {
            date: nextAnniversary,
            daysUntil: Math.ceil(diff / (1000 * 60 * 60 * 24)),
            anniversaryNumber: thisYear - anniversary.getFullYear() + 1
        };
    }

    /**
     * 销毁计时器
     */
    function destroy() {
        stop();
        startDate = null;
        callbacks.onUpdate = null;
    }

    // 暴露公开API
    return {
        init,
        start,
        stop,
        update,
        getTotalDays,
        getStartDate,
        setStartDate,
        formatTimeDiff,
        getNextAnniversary,
        destroy
    };
})();

// 导出到全局
window.Timer = Timer;
