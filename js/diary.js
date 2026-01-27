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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { create, getToday, getAll, remove, MOOD_ICONS, escapeHtml };
})();
