const Moments = (function() {
    function publish(content) {
        if (!content.trim()) return { success: false, message: '请输入内容' };
        const profile = Storage.getUserProfile();
        const moment = Storage.addMoment({ content: content.trim(), fromUser: profile.myName || '我' });
        return { success: true, moment };
    }

    function getList(limit) { 
        const list = Storage.getMoments();
        return limit ? list.slice(0, limit) : list; 
    }

    function renderCard(moment) {
        const date = new Date(moment.createdAt);
        const timeAgo = getTimeAgo(date);
        return `
            <div class="moment-item">
                <div class="moment-header">
                    <span class="moment-author">${escapeHtml(moment.fromUser)}</span>
                    <span class="moment-time">${timeAgo}</span>
                </div>
                <div class="moment-content">${escapeHtml(moment.content)}</div>
            </div>
        `;
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { publish, getList, renderCard };
})();
