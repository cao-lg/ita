/**
 * 报告图片导出模块
 * 使用 html2canvas 将报告区DOM转换为PNG图片
 */

const ReportExportImage = {
    async export(elementId, filename) {
        const el = document.getElementById(elementId);
        if (!el) {
            alert('未找到报告内容');
            return;
        }
        if (typeof html2canvas === 'undefined') {
            alert('图片导出库未加载，请检查网络');
            return;
        }

        const btn = event?.target;
        if (btn) {
            btn.textContent = '生成中...';
            btn.disabled = true;
        }

        try {
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 1200,
                windowWidth: 1200
            });

            // 添加水印
            const ctx = canvas.getContext('2d');
            ctx.font = '14px sans-serif';
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.textAlign = 'right';
            const user = Storage.getData().userInfo;
            const watermark = `经济管理大数据分析学习平台 | ${user.name || '学员'} | ${new Date().toLocaleDateString('zh-CN')}`;
            ctx.fillText(watermark, canvas.width - 20, canvas.height - 20);

            const link = document.createElement('a');
            link.download = filename || `学习报告_${user.name || '学员'}_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('导出图片失败:', e);
            alert('导出失败: ' + e.message);
        } finally {
            if (btn) {
                btn.textContent = '导出图片';
                btn.disabled = false;
            }
        }
    },

    // 快捷导出整个报告区
    async exportReport() {
        await this.export('report-container', null);
    }
};

window.ReportExportImage = ReportExportImage;
