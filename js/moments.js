/**
 * 动态模块
 * 负责情侣互动动态的发布和管理
 */

const Moments = (function() {
    // 动态类型
    const MOMENT_TYPES = {
        MESSAGE: 'message',
        PHOTO: 'photo',
        MILESTONE: 'milestone',
        GIFT: 'gift'
    };

    /**
     * 发布动态
     * @param {Object} momentData - 动态数据
     */
    function publish(momentData) {
        const userProfile = Storage.getUserProfile();
        
        const { type, content, images } = momentData;
        
        // 验证数据
        if (!content || content.trim().length === 0) {
            return { success: false, message: '请输入动态内容' };
        }
        
        if (content.length > 280) {
            return { success: false, message: '动态内容不能超过280字' };
        }
        
        // 保存动态
        const moment = Storage.addMoment({
            type: type || MOMENT_TYPES.MESSAGE,
            content: content.trim(),
            fromUser: userProfile.myName || '我',
            fromUserId: userProfile.id,
            toUser: userProfile.partnerName || 'TA',
            images: images || []
        });
        
        return { success: true, moment };
    }

    /**
     * 获取动态列表
     * @param {number} limit - 获取数量
     */
    function getList(limit = 20) {
        const moments = Storage.getMoments();
        return moments.slice(0, limit);
    }

    /**
     * 获取未读动态数量
     */
    function getUnreadCount() {
        const moments = Storage.getMoments();
        return moments.filter(m => !m.isRead).length;
    }

    /**
     * 标记所有动态已读
     */
    function markAllRead() {
        const moments = Storage.getMoments();
        moments.forEach(m => {
            if (!m.isRead) {
                Storage.markMomentRead(m.id);
            }
        });
    }

    /**
     * 获取里程碑动态
     */
    function getMilestones() {
        const moments = Storage.getMoments();
        return moments.filter(m => m.type === MOMENT_TYPES.MILESTONE);
    }

    /**
     * 快捷消息列表
     */
    const QUICK_MESSAGES = [
        { text: '想你啦 ❤️', message: '想你啦' },
        { text: '今天超开心 🌟', message: '今天超开心' },
        { text: '爱你哟 💕', message: '爱你哟' },
        { text: '晚安 🌙', message: '晚安' },
        { text: '早安 ☀️', message: '早安' },
        { text: '么么哒 💋', message: '么么哒' },
        { text: '有你真好 🌸', message: '有你真好' },
        { text: '一起加油 💪', message: '一起加油' }
    ];

    /**
     * 渲染动态卡片
     * @param {Object} moment - 动态数据
     */
    function renderCard(moment) {
        const date = new Date(moment.createdAt);
        const timeAgo = formatTimeAgo(date);
        
        // 根据类型选择图标
        const typeIcons = {
            message: 'ri-message-3-line',
            photo: 'ri-image-line',
            milestone: 'ri-flag-line',
            gift: 'ri-gift-line'
        };
        
        const iconClass = typeIcons[moment.type] || typeIcons.message;
        
        // 头像颜色
        const avatarColor = moment.fromUserId === Storage.getUserProfile().id 
            ? 'avatar-male' 
            : 'avatar-female';
        
        return `
            <div class="moment-item ${moment.isRead ? '' : 'unread'}" data-id="${moment.id}">
                <div class="moment-header">
                    <div class="moment-avatar">
                        <i class="ri-user-heart-line"></i>
                    </div>
                    <span class="moment-author">${escapeHtml(moment.fromUser)}</span>
                    <span class="moment-time">${timeAgo}</span>
                </div>
                <div class="moment-content">
                    ${escapeHtml(moment.content)}
                </div>
            </div>
        `;
    }

    /**
     * 渲染动态列表
     * @param {Array} moments - 动态数组
     * @param {HTMLElement} container - 容器元素
     */
    function renderList(moments, container) {
        if (!container) return;
        
        if (moments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="ri-heart-line"></i>
                    </div>
                    <p class="empty-state-title">还没有动态</p>
                    <p class="empty-state-description">发布第一条动态吧</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = moments.map(moment => renderCard(moment)).join('');
    }

    /**
     * 格式化时间为相对时间
     */
    function formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}天前`;
        }
        if (hours > 0) {
            return `${hours}小时前`;
        }
        if (minutes > 0) {
            return `${minutes}分钟前`;
        }
        return '刚刚';
    }

    /**
     * HTML转义
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 获取快捷消息列表
     */
    function getQuickMessages() {
        return QUICK_MESSAGES;
    }

    // 暴露公开API
    return {
        MOMENT_TYPES,
        publish,
        getList,
        getUnreadCount,
        markAllRead,
        getMilestones,
        renderCard,
        renderList,
        getQuickMessages
    };
})();

// 导出到全局
window.Moments = Moments;
