/**
 * 分享链接模块
 * 使用 LZ-String 压缩学习数据生成只读分享链接
 */

const ShareLink = {
    // 生成分享数据（仅包含分析摘要，不含敏感信息）
    generateShareData() {
        const data = Storage.getData();
        const stats = Storage.getStats();
        const cp = Storage.getCognitiveProfile();

        // 计算布鲁姆各维度正确率
        const bloomRates = {};
        Object.keys(cp.bloomTotals).forEach(k => {
            const total = cp.bloomTotals[k];
            bloomRates[k] = total > 0 ? Math.round((cp.bloomScores[k] / total) * 100) : 0;
        });

        // 计算SOLO各维度正确率
        const soloRates = {};
        Object.keys(cp.soloTotals).forEach(k => {
            const total = cp.soloTotals[k];
            soloRates[k] = total > 0 ? Math.round((cp.soloScores[k] / total) * 100) : 0;
        });

        // 知识点TOP5
        const knowledgeTop = Object.entries(cp.knowledgeScores)
            .map(([tag, scores]) => ({
                tag,
                rate: scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0,
                total: scores.total
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        return {
            v: 1,
            name: data.userInfo.name,
            className: data.userInfo.className,
            overallProgress: stats.overallProgress,
            avgScore: stats.avgScore,
            testPassed: stats.testPassed,
            testTotal: stats.testTotal,
            learnTime: data.totalLearnTime,
            wrongCount: stats.wrongCount,
            bloomRates,
            soloRates,
            knowledgeTop,
            generatedAt: new Date().toISOString()
        };
    },

    // 生成分享链接
    generate() {
        if (typeof LZString === 'undefined') {
            alert('分享库未加载，请检查网络');
            return null;
        }
        const shareData = this.generateShareData();
        const json = JSON.stringify(shareData);
        const compressed = LZString.compressToBase64(json);
        const url = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(compressed)}`;
        return url;
    },

    // 复制到剪贴板
    async copyToClipboard() {
        const url = this.generate();
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            alert('分享链接已复制到剪贴板！');
        } catch (e) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('分享链接已复制到剪贴板！');
        }
    },

    // 解析分享链接
    parseFromURL() {
        const params = new URLSearchParams(window.location.search);
        const shareParam = params.get('share');
        if (!shareParam || typeof LZString === 'undefined') return null;
        try {
            const compressed = decodeURIComponent(shareParam);
            const json = LZString.decompressFromBase64(compressed);
            return JSON.parse(json);
        } catch (e) {
            console.error('解析分享链接失败:', e);
            return null;
        }
    },

    // 渲染只读报告视图
    renderSharedReport(shareData, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !shareData) return;

        const bloomNames = { B1: '记忆', B2: '理解', B3: '应用', B4: '分析', B5: '评价', B6: '创造' };
        const soloNames = { S1: '单点', S2: '多点', S3: '关联', S4: '抽象拓展' };

        container.innerHTML = `
            <div class="shared-report">
                <div class="shared-report-header">
                    <h2>学习效果分享报告</h2>
                    <p>${shareData.name || '学员'} · ${shareData.className || '-'} · 生成于 ${new Date(shareData.generatedAt).toLocaleDateString('zh-CN')}</p>
                </div>
                <div class="shared-report-stats">
                    <div class="shared-stat-card"><div class="shared-stat-value">${shareData.overallProgress}%</div><div class="shared-stat-label">总进度</div></div>
                    <div class="shared-stat-card"><div class="shared-stat-value">${shareData.avgScore}</div><div class="shared-stat-label">平均分</div></div>
                    <div class="shared-stat-card"><div class="shared-stat-value">${shareData.testPassed}/${shareData.testTotal}</div><div class="shared-stat-label">通过项目</div></div>
                    <div class="shared-stat-card"><div class="shared-stat-value">${Math.round(shareData.learnTime / 60)}h</div><div class="shared-stat-label">学习时长</div></div>
                </div>
                <div class="shared-report-section">
                    <h4>布鲁姆认知层次掌握度</h4>
                    <div class="shared-bloom-bars">
                        ${Object.entries(shareData.bloomRates).map(([k, v]) => `
                            <div class="shared-bar-item">
                                <span class="shared-bar-label">${bloomNames[k]} ${k}</span>
                                <div class="shared-bar-track"><div class="shared-bar-fill" style="width:${v}%;background:${v>=80?'var(--success)':v>=60?'var(--warning)':'var(--danger)'}"></div></div>
                                <span class="shared-bar-value">${v}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="shared-report-section">
                    <h4>SOLO学习层次掌握度</h4>
                    <div class="shared-solo-bars">
                        ${Object.entries(shareData.soloRates).map(([k, v]) => `
                            <div class="shared-bar-item">
                                <span class="shared-bar-label">${soloNames[k]} ${k}</span>
                                <div class="shared-bar-track"><div class="shared-bar-fill" style="width:${v}%;background:${v>=80?'var(--success)':v>=60?'var(--warning)':'var(--danger)'}"></div></div>
                                <span class="shared-bar-value">${v}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ${shareData.knowledgeTop.length > 0 ? `
                <div class="shared-report-section">
                    <h4>主要知识点掌握情况</h4>
                    <div class="shared-knowledge-list">
                        ${shareData.knowledgeTop.map(k => `
                            <div class="shared-knowledge-item">
                                <span>${k.tag}</span>
                                <span style="color:${k.rate>=80?'var(--success)':k.rate>=60?'var(--warning)':'var(--danger)'}">${k.rate}% (${k.total}题)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }
};

window.ShareLink = ShareLink;
