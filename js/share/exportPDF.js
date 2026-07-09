/**
 * 报告PDF导出模块
 * 使用 html2canvas + jspdf 生成A4 PDF
 */

const ReportExportPDF = {
    async export(elementId, filename) {
        const el = document.getElementById(elementId);
        if (!el) {
            alert('未找到报告内容');
            return;
        }
        if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            alert('PDF导出库未加载，请检查网络');
            return;
        }

        const btn = event?.target;
        if (btn) {
            btn.textContent = '生成中...';
            btn.disabled = true;
        }

        try {
            const { jsPDF } = jspdf;
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: 1200,
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 标题页
            const user = Storage.getData().userInfo;
            pdf.setFontSize(18);
            pdf.text('学习效果诊断报告', pageWidth / 2, 30, { align: 'center' });
            pdf.setFontSize(12);
            pdf.text(`学员：${user.name || '-'}  班级：${user.className || '-'}  学号：${user.studentId || '-'}`, pageWidth / 2, 45, { align: 'center' });
            pdf.text(`生成日期：${new Date().toLocaleDateString('zh-CN')}`, pageWidth / 2, 55, { align: 'center' });

            // 报告内容图
            let heightLeft = imgHeight;
            let position = 65;

            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - position - margin);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 65;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= (pageHeight - margin);
            }

            pdf.save(filename || `学习诊断报告_${user.name || '学员'}_${new Date().toISOString().slice(0,10)}.pdf`);
        } catch (e) {
            console.error('导出PDF失败:', e);
            alert('导出失败: ' + e.message);
        } finally {
            if (btn) {
                btn.textContent = '导出PDF';
                btn.disabled = false;
            }
        }
    },

    async exportReport() {
        await this.export('report-container', null);
    }
};

window.ReportExportPDF = ReportExportPDF;
