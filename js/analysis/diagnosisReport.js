/**
 * 能力诊断报告
 * 基于认知画像生成个性化诊断和行动建议
 */

const DiagnosisReport = {
    render(containerId, customProfile = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cp = customProfile || Storage.getCognitiveProfile();
        if (!cp) {
            container.innerHTML = '<p class="empty-state-desc">暂无诊断数据</p>';
            return;
        }

        // 检查是否有数据
        const hasBloomData = Object.values(cp.bloomTotals || {}).some(v => v > 0);
        if (!hasBloomData) {
            container.innerHTML = '<p class="empty-state-desc">请先完成测验以生成诊断报告</p>';
            return;
        }

        // 1. 识别最低分布鲁姆维度
        const bloomKeys = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
        const bloomNames = { B1: '记忆', B2: '理解', B3: '应用', B4: '分析', B5: '评价', B6: '创造' };
        const bloomRates = bloomKeys.map(k => {
            const t = cp.bloomTotals[k] || 0;
            const s = cp.bloomScores[k] || 0;
            return { key: k, name: bloomNames[k], rate: t > 0 ? Math.round((s / t) * 100) : 0, total: t };
        });
        bloomRates.sort((a, b) => a.rate - b.rate);
        const weakestBloom = bloomRates[0];
        const strongestBloom = bloomRates[bloomRates.length - 1];

        // 2. 识别SOLO层次瓶颈
        const soloKeys = ['S1', 'S2', 'S3', 'S4'];
        const soloNames = { S1: '单点结构', S2: '多点结构', S3: '关联结构', S4: '抽象拓展' };
        const soloRates = soloKeys.map(k => {
            const t = cp.soloTotals[k] || 0;
            const s = cp.soloScores[k] || 0;
            return { key: k, name: soloNames[k], rate: t > 0 ? Math.round((s / t) * 100) : 0, total: t };
        });
        const soloProgress = soloRates.filter(s => s.total > 0).length;
        const highestSolo = soloRates.filter(s => s.total > 0).pop();

        // 3. 识别薄弱知识点
        const knowledgeScores = cp.knowledgeScores || {};
        const weakKnowledge = Object.entries(knowledgeScores)
            .map(([tag, scores]) => ({
                tag,
                rate: scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0,
                total: scores.total
            }))
            .filter(k => k.total > 0)
            .sort((a, b) => a.rate - b.rate)
            .slice(0, 3);

        // 4. 综合等级评定
        const avgRate = bloomRates.reduce((sum, b) => sum + b.rate, 0) / bloomRates.filter(b => b.total > 0).length || 0;
        let level = '初级分析师';
        let levelColor = '#94a3b8';
        if (avgRate >= 85 && soloProgress >= 3) {
            level = '高级分析师';
            levelColor = '#dc2626';
        } else if (avgRate >= 70 && soloProgress >= 2) {
            level = '进阶分析师';
            levelColor = '#2563eb';
        }

        // 生成建议
        const suggestions = [];
        if (weakestBloom.rate < 60 && weakestBloom.total > 0) {
            suggestions.push({
                icon: '⚠️',
                title: `强化${weakestBloom.name}能力`,
                desc: `您的${weakestBloom.name}层次正确率仅${weakestBloom.rate}%，建议重点练习该层次题目。`
            });
        }
        if (soloProgress < 3) {
            const nextSolo = soloNames[soloKeys[soloProgress]];
            suggestions.push({
                icon: '📈',
                title: `向「${nextSolo}」跃迁`,
                desc: `您目前主要停留在${highestSolo ? highestSolo.name : '单点结构'}层次，建议尝试需要整合多个知识点的综合题目。`
            });
        }
        if (weakKnowledge.length > 0) {
            suggestions.push({
                icon: '📚',
                title: '回顾薄弱知识点',
                desc: `建议复习：${weakKnowledge.map(k => `${k.tag}(${k.rate}%)`).join('、')}`
            });
        }
        if (avgRate >= 80) {
            suggestions.push({
                icon: '🎯',
                title: '挑战高阶题目',
                desc: '您的整体表现优秀，建议尝试创造层次(B6)的设计题和代码实现题。'
            });
        }

        // 渲染报告
        container.innerHTML = `
            <div class="diagnosis-report">
                <div class="diagnosis-header">
                    <div class="diagnosis-level" style="color:${levelColor}">${level}</div>
                    <div class="diagnosis-avg">综合正确率 ${Math.round(avgRate)}%</div>
                </div>
                <div class="diagnosis-grid">
                    <div class="diagnosis-card">
                        <div class="diagnosis-card-title">最强能力</div>
                        <div class="diagnosis-card-value" style="color:#16a34a">${strongestBloom.name}</div>
                        <div class="diagnosis-card-sub">正确率 ${strongestBloom.rate}%</div>
                    </div>
                    <div class="diagnosis-card">
                        <div class="diagnosis-card-title">待强化</div>
                        <div class="diagnosis-card-value" style="color:#dc2626">${weakestBloom.name}</div>
                        <div class="diagnosis-card-sub">正确率 ${weakestBloom.rate}%</div>
                    </div>
                    <div class="diagnosis-card">
                        <div class="diagnosis-card-title">SOLO层次</div>
                        <div class="diagnosis-card-value" style="color:#2563eb">${highestSolo ? highestSolo.name : '单点结构'}</div>
                        <div class="diagnosis-card-sub">已覆盖 ${soloProgress}/4 层</div>
                    </div>
                    <div class="diagnosis-card">
                        <div class="diagnosis-card-title">知识点覆盖</div>
                        <div class="diagnosis-card-value" style="color:#7c3aed">${Object.keys(knowledgeScores).length}</div>
                        <div class="diagnosis-card-sub">个知识标签</div>
                    </div>
                </div>
                <div class="diagnosis-suggestions">
                    <h4>🎯 行动建议</h4>
                    ${suggestions.map(s => `
                        <div class="suggestion-item">
                            <span class="suggestion-icon">${s.icon}</span>
                            <div class="suggestion-content">
                                <div class="suggestion-title">${s.title}</div>
                                <div class="suggestion-desc">${s.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

window.DiagnosisReport = DiagnosisReport;
