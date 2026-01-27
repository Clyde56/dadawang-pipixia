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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return { create, getList, canOpen, escapeHtml };
})();
