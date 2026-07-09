/**
 * 学习证书模块
 * 生成结业证书并支持下载
 */

const Certificate = {
    // 检查是否满足证书条件
    checkEligibility() {
        const data = Storage.getData();
        const projects = window.COURSE_DATA?.projects || [];
        if (projects.length === 0) return { eligible: false, reason: '课程数据未加载' };

        let allPassed = true;
        let totalBest = 0;
        let testCount = 0;

        for (const p of projects) {
            const tr = data.unitTestRecords[p.id];
            if (!tr || tr.bestScore < 60) {
                allPassed = false;
            }
            if (tr) {
                totalBest += tr.bestScore;
                testCount++;
            }
        }

        const avgScore = testCount > 0 ? Math.round(totalBest / testCount) : 0;

        if (!allPassed) {
            return { eligible: false, reason: `需完成全部${projects.length}个项目单元测试（≥60分）` };
        }
        if (avgScore < 80) {
            return { eligible: false, reason: `单元测试平均分需≥80分（当前${avgScore}分）` };
        }

        return {
            eligible: true,
            avgScore,
            level: avgScore >= 90 ? '高级分析师' : avgScore >= 80 ? '进阶分析师' : '初级分析师'
        };
    },

    // 生成证书HTML
    generateHTML() {
        const data = Storage.getData();
        const user = data.userInfo;
        const check = this.checkEligibility();
        const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

        return `
            <div class="certificate-wrapper" id="certificate-content">
                <div class="certificate-border">
                    <div class="certificate-header">
                        <div class="certificate-badge">经济管理大数据分析学习平台</div>
                        <h1 class="certificate-title">结业证书</h1>
                    </div>
                    <div class="certificate-body">
                        <p class="certificate-text">兹证明</p>
                        <p class="certificate-name">${user.name || '学员'}</p>
                        <p class="certificate-text">（班级：${user.className || '-'} &nbsp; 学号：${user.studentId || '-'}）</p>
                        <p class="certificate-text">已完成《经济管理大数据分析》全部课程学习，</p>
                        <p class="certificate-text">综合评定为</p>
                        <p class="certificate-level">${check.level || '---'}</p>
                        <p class="certificate-text">特发此证，以资鼓励。</p>
                    </div>
                    <div class="certificate-footer">
                        <div class="certificate-date">${date}</div>
                        <div class="certificate-seal">
                            <div class="seal-circle">
                                <span class="seal-text">恒信制造</span>
                                <span class="seal-sub">培训认证</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 显示证书弹窗
    show() {
        const check = this.checkEligibility();
        if (!check.eligible) {
            alert('尚未满足证书领取条件：' + check.reason);
            return;
        }

        // 创建证书弹窗
        let modal = document.getElementById('certificate-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'certificate-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="Certificate.close()"></div>
                <div class="modal-content" style="max-width:700px">
                    <div class="modal-header">
                        <h3>学习证书</h3>
                        <button class="modal-close" onclick="Certificate.close()">&times;</button>
                    </div>
                    <div class="modal-body" id="certificate-modal-body" style="padding:0;background:#f8f9fa"></div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="Certificate.close()">关闭</button>
                        <button class="btn-primary" onclick="Certificate.download()">下载证书</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        document.getElementById('certificate-modal-body').innerHTML = this.generateHTML();
        modal.classList.remove('hidden');
    },

    close() {
        const modal = document.getElementById('certificate-modal');
        if (modal) modal.classList.add('hidden');
    },

    // 下载证书为图片
    async download() {
        const el = document.getElementById('certificate-content');
        if (!el || typeof html2canvas === 'undefined') {
            alert('证书导出库未加载');
            return;
        }
        try {
            const canvas = await html2canvas(el, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            const user = Storage.getData().userInfo;
            link.download = `结业证书_${user.name || '学员'}_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('导出证书失败:', e);
            alert('导出失败: ' + e.message);
        }
    }
};

window.Certificate = Certificate;
