/**
 * 学习趋势分析
 * 双Y轴折线图：左轴得分趋势，右轴错题数量
 */

const LearningTrend = {
    chart: null,

    render(containerId, customData = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = customData || Storage.getData();
        if (!data) {
            container.innerHTML = '<p class="empty-state-desc">暂无学习趋势数据</p>';
            return;
        }

        // 收集所有答题记录按时间排序
        const records = [];

        // 小测记录
        Object.entries(data.quizRecords || {}).forEach(([taskId, r]) => {
            const ts = data.timestamps?.[taskId];
            if (ts) {
                records.push({
                    date: new Date(ts),
                    score: r.lastScore || 0,
                    type: 'quiz',
                    name: taskId
                });
            }
        });

        // 单元测试记录
        Object.entries(data.unitTestRecords || {}).forEach(([projectId, r]) => {
            (r.attempts || []).forEach(a => {
                records.push({
                    date: new Date(a.date),
                    score: a.score || 0,
                    type: 'unitTest',
                    name: projectId
                });
            });
        });

        if (records.length === 0) {
            container.innerHTML = '<p class="empty-state-desc">暂无学习趋势数据，请先完成测验</p>';
            return;
        }

        records.sort((a, b) => a.date - b.date);

        // 按日期聚合（同一天取平均分）
        const dateMap = new Map();
        records.forEach(r => {
            const dateStr = r.date.toISOString().split('T')[0];
            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, { scores: [], wrongs: 0 });
            }
            dateMap.get(dateStr).scores.push(r.score);
        });

        // 错题按日期统计
        (data.wrongQuestions || []).forEach(w => {
            const dateStr = w.timestamp ? w.timestamp.split('T')[0] : null;
            if (dateStr && dateMap.has(dateStr)) {
                dateMap.get(dateStr).wrongs++;
            }
        });

        const dates = Array.from(dateMap.keys()).sort();
        const avgScores = dates.map(d => {
            const scores = dateMap.get(d).scores;
            return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });
        const wrongCounts = dates.map(d => dateMap.get(d).wrongs);

        container.style.height = '320px';
        container.style.width = '100%';

        if (!this.chart) {
            this.chart = echarts.init(container);
        }

        const option = {
            title: {
                text: '学习趋势分析',
                left: 'center',
                textStyle: { fontSize: 15, fontWeight: 600, color: '#1e293b' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['平均得分', '错题数'],
                bottom: 0
            },
            grid: { left: '8%', right: '8%', bottom: '15%', top: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: { color: '#475569', fontSize: 11, rotate: 30 }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '平均得分',
                    position: 'left',
                    min: 0,
                    max: 100,
                    axisLabel: { formatter: '{value}分', color: '#475569' },
                    splitLine: { lineStyle: { color: '#f1f5f9' } }
                },
                {
                    type: 'value',
                    name: '错题数',
                    position: 'right',
                    min: 0,
                    axisLabel: { color: '#475569' },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '平均得分',
                    type: 'line',
                    data: avgScores,
                    smooth: true,
                    itemStyle: { color: '#2563eb' },
                    lineStyle: { width: 3 },
                    areaStyle: { color: 'rgba(37, 99, 235, 0.1)' },
                    symbol: 'circle',
                    symbolSize: 6
                },
                {
                    name: '错题数',
                    type: 'bar',
                    yAxisIndex: 1,
                    data: wrongCounts,
                    itemStyle: {
                        color: 'rgba(239, 68, 68, 0.6)',
                        borderRadius: [3, 3, 0, 0]
                    },
                    barWidth: '30%'
                }
            ]
        };

        this.chart.setOption(option);
    },

    dispose() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }
};

window.LearningTrend = LearningTrend;
