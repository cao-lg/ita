/**
 * 知识掌握热力图
 * X轴=知识点，Y轴=布鲁姆层次，色深表示掌握度
 */

const KnowledgeHeatmap = {
    chart: null,

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cp = Storage.getCognitiveProfile();
        if (!cp || !cp.knowledgeScores || Object.keys(cp.knowledgeScores).length === 0) {
            container.innerHTML = '<p class="empty-state-desc">暂无知识点掌握数据</p>';
            return;
        }

        // 知识点标签
        const knowledgeTags = Object.keys(cp.knowledgeScores).sort();
        const bloomNames = ['记忆(B1)', '理解(B2)', '应用(B3)', '分析(B4)', '评价(B5)', '创造(B6)'];
        const bloomKeys = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];

        // 构建热力图数据 [x, y, value]
        const heatmapData = [];
        knowledgeTags.forEach((tag, x) => {
            bloomKeys.forEach((b, y) => {
                const ks = cp.knowledgeScores[tag];
                const total = ks ? ks.total : 0;
                const correct = ks ? ks.correct : 0;
                // 简单处理：如果该知识点有数据，计算综合正确率
                // 实际应按bloom细分，但数据结构简化处理
                const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
                heatmapData.push([x, y, rate]);
            });
        });

        container.style.height = '350px';
        container.style.width = '100%';

        if (!this.chart) {
            this.chart = echarts.init(container);
        }

        const option = {
            title: {
                text: '知识掌握热力图',
                left: 'center',
                textStyle: { fontSize: 15, fontWeight: 600, color: '#1e293b' }
            },
            tooltip: {
                position: 'top',
                formatter: (params) => {
                    return `${knowledgeTags[params.data[0]]}<br/>${bloomNames[params.data[1]]}<br/>掌握度：${params.data[2]}%`;
                }
            },
            grid: { left: '15%', right: '8%', bottom: '20%', top: '15%' },
            xAxis: {
                type: 'category',
                data: knowledgeTags,
                splitArea: { show: true },
                axisLabel: { color: '#475569', fontSize: 11, rotate: 30 }
            },
            yAxis: {
                type: 'category',
                data: bloomNames,
                splitArea: { show: true },
                axisLabel: { color: '#475569', fontSize: 11 }
            },
            visualMap: {
                min: 0,
                max: 100,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                inRange: {
                    color: ['#fef2f2', '#fecaca', '#f87171', '#ef4444', '#b91c1c']
                },
                text: ['高', '低'],
                textStyle: { color: '#475569' }
            },
            series: [{
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: true,
                    formatter: (params) => params.data[2] > 0 ? params.data[2] + '%' : '',
                    fontSize: 11,
                    color: '#fff'
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1
                }
            }]
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

window.KnowledgeHeatmap = KnowledgeHeatmap;
