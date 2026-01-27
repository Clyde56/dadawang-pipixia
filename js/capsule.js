const Capsule = (function() {
    function create(content, openDate) {
        if (!content.trim()) return { success: false, message: '请输入内容' };
        if (!openDate) return { success: false, message: '请选择开启日期' };
        const capsule = Storage.addCapsule({ content: content.trim(), openDate });
        return { success: true, capsule };
    }

    function getList() { return Storage.getCapsules(); }

    function canOpen(capsule) {
        return new Date(capsule.openDate) <= new Date();
    }

    function renderCard(capsule) {
        const canOpenNow = canOpen(capsule);
        return `
            <div class="capsule-card ${capsule.isOpened ? 'opened' : ''}">
                <div class="capsule-header">
                    <span class="capsule-date">${capsule.openDate}</span>
                    <span class="capsule-status">${capsule.isOpened ? '已开启' : (canOpenNow ? '可开启' : '待开启')}</span>
                </div>
                <div class="capsule-content">${capsule.isOpened ? capsule.content : '********'}</div>
                ${canOpenNow && !capsule.isOpened ? `<button class="btn-primary open-capsule-btn" data-id="${capsule.id}">开启胶囊</button>` : ''}
            </div>
        `;
    }

    function renderList(capsules, container) {
        if (!container) return;
        if (capsules.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>还没有时光胶囊</p></div>';
            return;
        }
        container.innerHTML = capsules.map(c => renderCard(c)).join('');
    }

    return { create, getList, canOpen, renderCard, renderList };
})();
