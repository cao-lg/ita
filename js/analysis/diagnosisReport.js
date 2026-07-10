/**
 * 能力诊断报告
 * 基于认知画像生成个性化诊断和行动建议
 * 含多维度图表可视化
 */

const DiagnosisReport = {
    // 知识点 → 项目ID 映射（用于行动建议跳转）
    _tagProjectMap: {
        'Python基础': 'p1', '环境搭建': 'p1', '数据类型': 'p1', 'Python数据类型': 'p1',
        '财务精度': 'p1', 'Python循环': 'p1', '折旧计算': 'p1', '浮点精度': 'p1',
        '数据类型选择': 'p1',
        '数据获取': 'p2', 'Excel': 'p2', 'requests': 'p2',
        '爬虫合规': 'p2', '网络伦理': 'p2', '法律风险': 'p2', '文件操作': 'p2',
        'Pandas': 'p3', '数据清洗': 'p3', '数据筛选': 'p3', '字符串处理': 'p3',
        '缺失值处理': 'p3', '数据策略': 'p3', '函数设计': 'p3', '异常处理': 'p3',
        '数据分析': 'p4', '财务指标': 'p4', 'ROE': 'p4', '杜邦分析': 'p4',
        '财务对比': 'p4', '财务分析': 'p4', '环比分析': 'p4', '统计': 'p4',
        '数据分析流程': 'p4', '异常值处理': 'p4',
        '可视化': 'p5', 'Matplotlib': 'p5', 'Pyecharts': 'p5', '图表选择': 'p5',
        '可视化设计': 'p5', '看板设计': 'p5', '双轴图': 'p5',
        '综合应用': 'p6', '报告撰写': 'p6', '数据看板': 'p6',
        '指标体系': 'p6', '评价体系': 'p6', '综合分析': 'p6',
        '条件判断': 'p1', '循环': 'p1'
    },

    // Bloom → 推荐项目ID
    _bloomProjectMap: {
        'B1': 'p1', 'B2': 'p2', 'B3': 'p3', 'B4': 'p4', 'B5': 'p5', 'B6': 'p6'
    },

    // 生成跳转链接 HTML
    _link(text, projectId) {
        if (!projectId || !window.COURSE_DATA) return text;
        const proj = window.COURSE_DATA.projects.find(p => p.id === projectId);
        if (!proj) return text;
        const firstTask = proj.tasks?.[0]?.id;
        if (!firstTask) return text;
        return `<a href="javascript:void(0)" class="dr-suggestion-link" data-task="${firstTask}">${text}</a>`;
    },

    // 绑定链接点击事件
    _bindLinkEvents(container) {
        container.querySelectorAll('.dr-suggestion-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const taskId = e.target.dataset.task;
                if (taskId && typeof window.loadTask === 'function') {
                    window.loadTask(taskId);
                }
            });
        });
    },

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

        // 1. 布鲁姆维度数据
        const bloomKeys = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
        const bloomNames = { B1: '记忆', B2: '理解', B3: '应用', B4: '分析', B5: '评价', B6: '创造' };
        const bloomList = bloomKeys.map(k => {
            const t = cp.bloomTotals[k] || 0;
            const s = cp.bloomScores[k] || 0;
            return { key: k, name: bloomNames[k], rate: t > 0 ? Math.round((s / t) * 100) : 0, total: t };
        });
        const sortedBloom = [...bloomList].sort((a, b) => a.rate - b.rate);
        const weakestBloom = sortedBloom[0];
        const strongestBloom = sortedBloom[sortedBloom.length - 1];

        // 2. SOLO层次数据
        const soloKeys = ['S1', 'S2', 'S3', 'S4'];
        const soloNames = { S1: '单点结构', S2: '多点结构', S3: '关联结构', S4: '抽象拓展' };
        const soloList = soloKeys.map(k => {
            const t = cp.soloTotals[k] || 0;
            const s = cp.soloScores[k] || 0;
            return { key: k, name: soloNames[k], rate: t > 0 ? Math.round((s / t) * 100) : 0, total: t };
        });
        const soloProgress = soloList.filter(s => s.total > 0).length;
        const highestSolo = soloList.filter(s => s.total > 0).pop();
        const lowestSolo = soloList.filter(s => s.total > 0)[0];

        // 3. 知识点数据
        const knowledgeScores = cp.knowledgeScores || {};
        const knowledgeList = Object.entries(knowledgeScores)
            .map(([tag, scores]) => ({
                tag,
                rate: scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0,
                total: scores.total,
                correct: scores.correct
            }))
            .filter(k => k.total > 0)
            .sort((a, b) => a.rate - b.rate);
        const weakKnowledge = knowledgeList.slice(0, 3);

        // 4. 综合等级评定
        const avgRate = bloomList.reduce((sum, b) => sum + b.rate, 0) / bloomList.filter(b => b.total > 0).length || 0;
        let level = '初级分析师';
        let levelColor = '#94a3b8';
        let levelBadge = 'level-1';
        if (avgRate >= 85 && soloProgress >= 3) {
            level = '高级分析师';
            levelColor = '#dc2626';
            levelBadge = 'level-3';
        } else if (avgRate >= 70 && soloProgress >= 2) {
            level = '进阶分析师';
            levelColor = '#2563eb';
            levelBadge = 'level-2';
        }

        // 渲染HTML结构
        container.innerHTML = `
            <div class="diagnosis-report">
                <!-- 头部等级 -->
                <div class="dr-header">
                    <div class="dr-level-badge ${levelBadge}">${level}</div>
                    <div class="dr-stats-row">
                        <div class="dr-stat-item">
                            <span class="dr-stat-label">综合正确率</span>
                            <span class="dr-stat-value" style="color:${avgRate>=80?'#16a34a':avgRate>=60?'#d97706':'#dc2626'}">${Math.round(avgRate)}%</span>
                        </div>
                        <div class="dr-stat-item">
                            <span class="dr-stat-label">SOLO层次覆盖</span>
                            <span class="dr-stat-value" style="color:#2563eb">${soloProgress}/4</span>
                        </div>
                        <div class="dr-stat-item">
                            <span class="dr-stat-label">知识点</span>
                            <span class="dr-stat-value" style="color:#7c3aed">${knowledgeList.length}</span>
                        </div>
                    </div>
                </div>

                <!-- 第一行：KPI卡片 + 图表 -->
                <div class="dr-row">
                    <div class="dr-kpi-grid">
                        <div class="dr-kpi-card">
                            <div class="dr-kpi-icon dr-kpi-strong">✓</div>
                            <div class="dr-kpi-body">
                                <div class="dr-kpi-label">最强能力</div>
                                <div class="dr-kpi-value" style="color:#16a34a">${strongestBloom.name}</div>
                                <div class="dr-kpi-bar"><div class="dr-kpi-bar-fill" style="width:${strongestBloom.rate}%;background:#16a34a"></div></div>
                                <div class="dr-kpi-sub">正确率 ${strongestBloom.rate}% · 答对 ${cp.bloomScores[strongestBloom.key]||0}/${cp.bloomTotals[strongestBloom.key]||0} 题</div>
                            </div>
                        </div>
                        <div class="dr-kpi-card">
                            <div class="dr-kpi-icon dr-kpi-weak">!</div>
                            <div class="dr-kpi-body">
                                <div class="dr-kpi-label">待强化</div>
                                <div class="dr-kpi-value" style="color:#dc2626">${weakestBloom.name}</div>
                                <div class="dr-kpi-bar"><div class="dr-kpi-bar-fill" style="width:${weakestBloom.rate}%;background:#dc2626"></div></div>
                                <div class="dr-kpi-sub">正确率 ${weakestBloom.rate}% · 答对 ${cp.bloomScores[weakestBloom.key]||0}/${cp.bloomTotals[weakestBloom.key]||0} 题</div>
                            </div>
                        </div>
                        <div class="dr-kpi-card">
                            <div class="dr-kpi-icon dr-kpi-solo">◈</div>
                            <div class="dr-kpi-body">
                                <div class="dr-kpi-label">SOLO最高层次</div>
                                <div class="dr-kpi-value" style="color:#2563eb">${highestSolo ? highestSolo.name : '单点结构'}</div>
                                <div class="dr-kpi-bar"><div class="dr-kpi-bar-fill" style="width:${(soloProgress/4)*100}%;background:#2563eb"></div></div>
                                <div class="dr-kpi-sub">已覆盖 ${soloProgress}/4 层 · 正确率 ${highestSolo ? highestSolo.rate + '%' : '-'}</div>
                            </div>
                        </div>
                        <div class="dr-kpi-card">
                            <div class="dr-kpi-icon dr-kpi-know">#</div>
                            <div class="dr-kpi-body">
                                <div class="dr-kpi-label">知识点覆盖</div>
                                <div class="dr-kpi-value" style="color:#7c3aed">${knowledgeList.length}</div>
                                <div class="dr-kpi-bar"><div class="dr-kpi-bar-fill" style="width:${Math.min(100, (knowledgeList.length/12)*100)}%;background:#7c3aed"></div></div>
                                <div class="dr-kpi-sub">个知识点标签 · 总答题 ${knowledgeList.reduce((s,k)=>s+k.total,0)} 题</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 第二行：图表行 -->
                <div class="dr-row">
                    <div class="dr-chart-col">
                        <div class="dr-chart-card">
                            <div class="dr-chart-header">布鲁姆各维度正确率</div>
                            <div class="dr-chart-body" id="dr-chart-bloom" style="height:220px"></div>
                        </div>
                    </div>
                    <div class="dr-chart-col">
                        <div class="dr-chart-card">
                            <div class="dr-chart-header">SOLO层次答题分布</div>
                            <div class="dr-chart-body" id="dr-chart-solo" style="height:220px"></div>
                        </div>
                    </div>
                </div>

                <!-- 第三行：知识点掌握进度 -->
                <div class="dr-row">
                    <div class="dr-chart-col full">
                        <div class="dr-chart-card">
                            <div class="dr-chart-header">各知识点掌握度</div>
                            <div class="dr-chart-body" id="dr-chart-knowledge" style="height:${Math.max(180, knowledgeList.length * 36 + 40)}px"></div>
                        </div>
                    </div>
                </div>

                <!-- 第四行：行为画像 -->
                <div class="dr-row" id="dr-behavior-row" style="display:none">
                    <div class="dr-chart-col full">
                        <div class="dr-chart-card">
                            <div class="dr-chart-header">📊 学习行为画像</div>
                            <div class="dr-behavior-body" id="dr-behavior-body"></div>
                        </div>
                    </div>
                </div>

                <!-- 第五行：行动建议 -->
                <div class="dr-row">
                    <div class="dr-chart-col full">
                        <div class="dr-suggestions-card">
                            <div class="dr-chart-header">🎯 行动建议</div>
                            <div class="dr-suggestions-body">
                                ${this._generateSuggestions(weakestBloom, soloProgress, soloNames, soloKeys, highestSolo, weakKnowledge, avgRate)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 渲染图表
        this._renderBloomChart(bloomList);
        this._renderSoloChart(soloList);
        this._renderKnowledgeChart(knowledgeList);

        // 渲染行为画像
        this._renderBehaviorProfile(container);

        // 绑定建议中的跳转链接
        this._bindLinkEvents(container);
    },

    _generateSuggestions(weakestBloom, soloProgress, soloNames, soloKeys, highestSolo, weakKnowledge, avgRate) {
        const items = [];
        if (weakestBloom.rate < 60 && weakestBloom.total > 0) {
            items.push({
                icon: '⚠️', color: '#dc2626',
                title: `强化「${weakestBloom.name}」能力`,
                desc: `您在${weakestBloom.name}层次正确率仅 ${weakestBloom.rate}%，是当前最大的短板。建议：`,
                steps: [
                    `${this._link('回顾该层次相关知识点，重做错题', this._bloomProjectMap[weakestBloom.key])}`,
                    `${this._link(weakestBloom.key === 'B4' ? '尝试案例分析题' : weakestBloom.key === 'B5' ? '尝试方案评价题' : '尝试综合应用题', this._bloomProjectMap[weakestBloom.key])} 加强训练`,
                    '与同学讨论解题思路，加深理解'
                ]
            });
        }
        if (soloProgress < 4) {
            const nextSolo = soloNames[soloKeys[soloProgress]] || soloNames[soloKeys[3]];
            items.push({
                icon: '📈', color: '#2563eb',
                title: `向「${nextSolo}」层次跃迁`,
                desc: `您当前覆盖 ${soloProgress}/4 个SOLO层次，最高达到 ${highestSolo ? highestSolo.name : '-'}。建议：`,
                steps: [
                    soloProgress < 2 ? '多做需要多知识点配合的题目' : '尝试跨章节综合分析题',
                    soloProgress < 3 ? '练习关联多个概念的案例分析' : '挑战开放式设计题，提出创新方案',
                    '注重解题过程的逻辑链条完整性'
                ]
            });
        }
        if (weakKnowledge.length > 0) {
            const weakTags = weakKnowledge.map(k => `${k.tag}(${k.rate}%)`).join('、');
            items.push({
                icon: '📚', color: '#d97706',
                title: '回顾薄弱知识点',
                desc: `以下知识点掌握度较低，建议优先复习：`,
                steps: weakKnowledge.map(k => [
                    `${this._link('复习「' + k.tag + '」章节内容（正确率 ' + k.rate + '%）', this._tagProjectMap[k.tag])}`,
                    `${this._link('重做相关练习题 ' + k.total + ' 道', this._tagProjectMap[k.tag])}`,
                    k.rate < 50 ? this._link('建议从头学习该章节', this._tagProjectMap[k.tag]) : '查漏补缺即可'
                ]).flat()
            });
        }
        if (avgRate >= 80) {
            items.push({
                icon: '🎯', color: '#7c3aed',
                title: '挑战高阶题目',
                desc: '您的整体表现优秀，可以挑战更高难度：',
                steps: [
                    this._link('尝试B6创造层次的代码实现题和设计题', 'p6'),
                    '用学到的知识分析真实财务报表数据',
                    this._link('尝试独立构建一个数据可视化看板项目', 'p5')
                ]
            });
        }
        if (items.length === 0) {
            items.push({
                icon: '💪', color: '#16a34a',
                title: '继续学习',
                desc: '完成更多测验后将获得更详细的诊断建议。',
                steps: ['完成当前项目的学习任务', '按时参加单元测试', '定期回顾错题本']
            });
        }

        return items.map(item => `
            <div class="dr-suggestion-item">
                <div class="dr-suggestion-icon" style="background:${item.color}15;color:${item.color}">${item.icon}</div>
                <div class="dr-suggestion-content">
                    <div class="dr-suggestion-title" style="color:${item.color}">${item.title}</div>
                    <div class="dr-suggestion-desc">${item.desc}</div>
                    <ul class="dr-suggestion-steps">
                        ${item.steps.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    },

    _renderBloomChart(bloomList) {
        const container = document.getElementById('dr-chart-bloom');
        if (!container) return;
        if (typeof echarts === 'undefined') return;

        const chart = echarts.init(container);
        const sorted = [...bloomList].sort((a, b) => a.rate - b.rate);
        chart.setOption({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
            xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
            yAxis: { type: 'category', data: sorted.map(d => d.name), axisLabel: { color: '#475569', fontSize: 12 } },
            series: [{
                type: 'bar',
                data: sorted.map(d => ({
                    value: d.rate,
                    itemStyle: {
                        color: d.rate >= 80 ? '#16a34a' : d.rate >= 60 ? '#d97706' : '#dc2626',
                        borderRadius: [0, 4, 4, 0]
                    }
                })),
                barWidth: '60%',
                label: {
                    show: true,
                    position: 'right',
                    formatter: (p) => `${p.value}%`,
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: 12
                }
            }]
        });
        window.addEventListener('resize', () => chart.resize());
    },

    _renderSoloChart(soloList) {
        const container = document.getElementById('dr-chart-solo');
        if (!container) return;
        if (typeof echarts === 'undefined') return;

        const chart = echarts.init(container);
        const names = soloList.map(s => s.name);
        const totals = soloList.map(s => s.total);
        const rates = soloList.map(s => s.rate);

        chart.setOption({
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const idx = params[0].dataIndex;
                    return `${names[idx]}<br/>答题量：${totals[idx]} 题<br/>正确率：${rates[idx]}%`;
                }
            },
            legend: { data: ['答题量', '正确率'], bottom: 0, icon: 'circle', itemWidth: 8 },
            grid: { left: '3%', right: '8%', bottom: '18%', top: '5%', containLabel: true },
            xAxis: { type: 'category', data: names, axisLabel: { color: '#475569', fontSize: 11 } },
            yAxis: [
                { type: 'value', name: '答题量', min: 0, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
                { type: 'value', name: '正确率', min: 0, max: 100, axisLabel: { formatter: '{value}%', color: '#94a3b8' }, splitLine: { show: false } }
            ],
            series: [
                {
                    name: '答题量', type: 'bar', yAxisIndex: 0,
                    data: totals.map((v, i) => ({
                        value: v,
                        itemStyle: { color: ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8'][i], borderRadius: [4, 4, 0, 0] }
                    })),
                    barWidth: '36%',
                    label: { show: true, position: 'top', color: '#475569', fontSize: 11 }
                },
                {
                    name: '正确率', type: 'line', yAxisIndex: 1,
                    data: rates,
                    itemStyle: { color: '#f59e0b' },
                    lineStyle: { width: 2.5 },
                    symbol: 'circle', symbolSize: 7,
                    label: { show: true, formatter: '{c}%', color: '#f59e0b', fontWeight: 600, fontSize: 11 }
                }
            ]
        });
        window.addEventListener('resize', () => chart.resize());
    },

    _renderKnowledgeChart(knowledgeList) {
        const container = document.getElementById('dr-chart-knowledge');
        if (!container) return;
        if (typeof echarts === 'undefined') return;

        const chart = echarts.init(container);
        const sorted = [...knowledgeList].sort((a, b) => a.rate - b.rate);

        chart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const d = sorted[params[0].dataIndex];
                    return `${d.tag}<br/>正确率：${d.rate}%<br/>答对：${d.correct} / ${d.total} 题`;
                }
            },
            grid: { left: '3%', right: '15%', bottom: '3%', top: '5%', containLabel: true },
            xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
            yAxis: { type: 'category', data: sorted.map(d => d.tag), axisLabel: { color: '#475569', fontSize: 11 } },
            series: [{
                type: 'bar',
                data: sorted.map(d => ({
                    value: d.rate,
                    itemStyle: {
                        color: d.rate >= 80 ? '#16a34a' : d.rate >= 60 ? '#d97706' : '#dc2626',
                        borderRadius: [0, 4, 4, 0]
                    }
                })),
                barWidth: '55%',
                label: {
                    show: true,
                    position: 'right',
                    formatter: (p) => `${p.value}%`,
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: 11
                }
            }]
        });
        window.addEventListener('resize', () => chart.resize());
    },

    /**
     * 渲染行为画像面板
     * 基于 Winne & Hadwin (1998) SRL 四阶段 + Zimmerman (2002) 三阶段循环
     */
    _renderBehaviorProfile(container) {
        const row = document.getElementById('dr-behavior-row');
        const body = document.getElementById('dr-behavior-body');
        if (!row || !body) return;
        if (typeof BehaviorTracker === 'undefined') return;

        const bp = BehaviorTracker.computeBehaviorProfile();
        const s = bp.sessionSummary || {};

        // 无数据时隐藏
        if (s.totalEvents < 5) {
            row.style.display = 'none';
            return;
        }
        row.style.display = '';

        const slotLabels = { morning: '上午(6-12)', afternoon: '下午(12-18)', evening: '晚间(18-22)', night: '深夜(22-6)' };
        const timeDist = Object.entries(s.hourDistribution || {}).map(([k, v]) => `${slotLabels[k] || k} ${v}次`).join(' · ');

        body.innerHTML = `
            <div class="dr-behavior-grid">
                <div class="dr-bp-card">
                    <div class="dr-bp-label">学习节奏</div>
                    <div class="dr-bp-stats">
                        <span>${s.totalSessions || 0}次会话</span>
                        <span>均${s.avgDurationMin || 0}分钟</span>
                        <span>${bp.preferredTimeSlot || '-'}</span>
                    </div>
                    <div class="dr-bp-sub">${timeDist}</div>
                </div>
                <div class="dr-bp-card">
                    <div class="dr-bp-label">冲动 / 审慎</div>
                    <div class="dr-bp-badge ${this._labelClass(bp.impulseCareful?.label)}">${bp.impulseCareful?.label || '数据不足'}</div>
                    <div class="dr-bp-stats">
                        <span>均${bp.impulseCareful?.avgResponseTimeSec || 0}秒/题</span>
                        <span>变更${bp.impulseCareful?.answerChangeRate || 0}%</span>
                        <span>快猜${bp.impulseCareful?.fastGuessRate || 0}%</span>
                    </div>
                </div>
                <div class="dr-bp-card">
                    <div class="dr-bp-label">完整 / 跳过</div>
                    <div class="dr-bp-badge ${this._labelClass(bp.completeSkip?.label)}">${bp.completeSkip?.label || '数据不足'}</div>
                    <div class="dr-bp-stats">
                        <span>完成率${bp.completeSkip?.quizCompletionRate || 0}%</span>
                        <span>滚动${bp.completeSkip?.avgMaterialScrollPercent || 0}%</span>
                    </div>
                </div>
                <div class="dr-bp-card">
                    <div class="dr-bp-label">反思 / 重复</div>
                    <div class="dr-bp-badge ${this._labelClass(bp.reflectiveRepetitive?.label)}">${bp.reflectiveRepetitive?.label || '数据不足'}</div>
                    <div class="dr-bp-stats">
                        <span>反馈${bp.reflectiveRepetitive?.feedbackViewRate || 0}%</span>
                        <span>重访${bp.reflectiveRepetitive?.taskRevisitRate || 0}%</span>
                        <span>错题重做${bp.reflectiveRepetitive?.wrongRetryCount || 0}次</span>
                    </div>
                </div>
                <div class="dr-bp-card">
                    <div class="dr-bp-label">独立 / 依赖</div>
                    <div class="dr-bp-badge ${this._labelClass(bp.independentDependent?.label)}">${bp.independentDependent?.label || '数据不足'}</div>
                    <div class="dr-bp-stats">
                        <span>提示${bp.independentDependent?.hintViewCount || 0}次</span>
                        <span>有效求助${bp.independentDependent?.effectiveHelpRate || 0}%</span>
                    </div>
                </div>
                <div class="dr-bp-card">
                    <div class="dr-bp-label">坚持 / 放弃</div>
                    <div class="dr-bp-badge ${this._labelClass(bp.persistentGiveup?.label)}">${bp.persistentGiveup?.label || '数据不足'}</div>
                    <div class="dr-bp-stats">
                        <span>回退${bp.persistentGiveup?.fallbackTriggerCount || 0}次</span>
                        <span>矫正掌握${bp.persistentGiveup?.correctionMasteryRate || 0}%</span>
                        <span>放弃率${bp.persistentGiveup?.abandonmentRate || 0}%</span>
                    </div>
                </div>
            </div>
            <div class="dr-bp-summary">
                <span>首次作答正确率: <strong>${bp.firstAttemptAccuracy || 0}%</strong></span>
                <span>行为事件总数: <strong>${s.totalEvents || 0}</strong></span>
                <span>画像基于 Winne & Hadwin (1998) SRL 模型 + Zimmerman (2002) 三阶段循环</span>
            </div>
            <div id="dr-behavior-radar" style="height:280px"></div>
        `;

        this._renderBehaviorRadar(bp);
    },

    _labelClass(label) {
        if (!label) return '';
        if (label.includes('审慎') || label.includes('完整') || label.includes('深度') || label.includes('独立') || label.includes('坚持')) return 'bp-good';
        if (label.includes('冲动') || label.includes('跳过') || label.includes('浅层') || label.includes('过度') || label.includes('放弃')) return 'bp-warn';
        return 'bp-neutral';
    },

    _renderBehaviorRadar(bp) {
        const container = document.getElementById('dr-behavior-radar');
        if (!container || typeof echarts === 'undefined') return;

        const chart = echarts.init(container);
        // 将五维映射到 0-100 标准分
        const ic = bp.impulseCareful || {};
        const cs = bp.completeSkip || {};
        const rr = bp.reflectiveRepetitive || {};
        const ind = bp.independentDependent || {};
        const pg = bp.persistentGiveup || {};

        const indicators = [
            { name: '审慎度', max: 100 },
            { name: '完整性', max: 100 },
            { name: '反思度', max: 100 },
            { name: '独立性', max: 100 },
            { name: '坚持度', max: 100 }
        ];
        const values = [
            Math.min(100, (ic.avgResponseTimeSec || 0) * 3 + (ic.answerChangeRate || 0) * 0.5),
            cs.quizCompletionRate || 0,
            (rr.feedbackViewRate || 0) * 0.6 + (rr.taskRevisitRate || 0) * 0.4,
            100 - Math.min(100, (ind.hintViewCount || 0) * 10),
            (100 - (pg.abandonmentRate || 0)) * 0.6 + (pg.correctionMasteryRate || 0) * 0.4
        ].map(v => Math.round(v));

        chart.setOption({
            tooltip: {},
            radar: {
                indicator: indicators,
                shape: 'circle',
                splitNumber: 4,
                axisName: { color: '#475569', fontSize: 12 },
                splitArea: { areaStyle: { color: ['rgba(37,99,235,0.02)', 'rgba(37,99,235,0.05)'] } }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: values,
                    name: '行为画像',
                    areaStyle: { color: 'rgba(37,99,235,0.15)' },
                    lineStyle: { color: '#2563eb', width: 2 },
                    itemStyle: { color: '#2563eb' }
                }]
            }]
        });
        window.addEventListener('resize', () => chart.resize());
    }
};

window.DiagnosisReport = DiagnosisReport;
