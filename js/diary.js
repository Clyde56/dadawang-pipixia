const Diary = (function() {
    const MOOD_ICONS = { happy: '😊', loved: '😍', grateful: '🙏', peaceful: '😌', excited: '🤩' };

    function create(content, mood = 'happy', images = []) {
        if (!content.trim()) return { success: false, message: '请输入内容' };
        const diary = Storage.addDiary({ content: content.trim(), mood, images });
        return { success: true, diary };
    }

    function getToday() {
        const today = new Date().toISOString().split('T')[0];
        return Storage.getDiaries().filter(d => d.createdAt.startsWith(today));
    }

    function getAll() { return Storage.getDiaries(); }

    function remove(id) { Storage.deleteDiary(id); return { success: true }; }

    function renderCard(diary) {
        const date = new Date(diary.createdAt);
        const icon = MOOD_ICONS[diary.mood] || '😊';
        return `
            <div class="diary-card" data-id="${diary.id}">
                <div class="diary-card-header">
                    <span class="diary-card-date">${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}</span>
                    <span>${icon}</span>
                </div>
                <div class="diary-card-content">${escapeHtml(diary.content)}</div>
                <div class="diary-actions">
                    <button class="delete-diary-btn" data-id="${diary.id}">删除</button>
                </div>
            </div>
        `;
    }

    function renderList(diaries, container) {
        if (!container) return;
        if (diaries.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>还没有日记</p></div>';
            return;
        }
        container.innerHTML = diaries.map(d => renderCard(d)).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { create, getToday, getAll, remove, renderCard, renderList, MOOD_ICONS };
})();
