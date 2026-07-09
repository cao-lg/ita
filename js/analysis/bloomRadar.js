/**
 * 布鲁姆六维认知雷达图
 * 展示学生在记忆/理解/应用/分析/评价/创造六个层次的掌握情况
 */

const BloomRadar = {
    chart: null,

    render(containerId, customProfile = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cp = customProfile || Storage.getCognitiveProfile();
        if (!cp) {
            container.innerHTML = '<p class="empty-state-desc">暂无认知画像数据，请先完成测验</p>';
            return;
        }

        // 计算各维度得分率
        const dimensions = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
        const names = ['记忆', '理解', '应用', '分析', '评价', '创造'];
        const data = dimensions.map((d, i) => {
            const total = cp.bloomTotals[d] || 0;
            const score = cp.bloomScores[d] || 0;
            const rate = total > 0 ? Math.round((score / total) * 100) : 0;
            return { name: names[i], value: rate, key: d };
        });

        // 检查是否所有维度都为0
        const hasData = data.some(d => d.value > 0);
        if (!hasData) {
            container.innerHTML = '<p class="empty-state-desc">暂无认知画像数据，请先完成测验</p>';
            return;
        }

        container.style.height = '380px';
        container.style.width = '100%';

        if (!this.chart) {
            this.chart = echarts.init(container);
        }

        const option = {
            title: {
                text: '布鲁姆认知层次能力雷达图',
                left: 'center',
                textStyle: { fontSize: 15, fontWeight: 600, color: '#1e293b' }
            },
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const d = data[params.dataIndex];
                    const total = cp.bloomTotals[d.key] || 0;
                    const score = cp.bloomScores[d.key] || 0;
                    return `${d.name}（${d.key}）<br/>正确率：${d.value}%<br/>答对：${score} / ${total} 题`;
                }
            },
            radar: {
                indicator: data.map(d => ({ name: d.name, max: 100 })),
                radius: '65%',
                center: ['50%', '55%'],
                axisName: {
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 500
                },
                splitArea: {
                    areaStyle: {
                        color: ['rgba(37, 99, 235, 0.02)', 'rgba(37, 99, 235, 0.05)',
                                'rgba(37, 99, 235, 0.08)', 'rgba(37, 99, 235, 0.11)']
                    }
                },
                axisLine: { lineStyle: { color: '#cbd5e1' } },
                splitLine: { lineStyle: { color: '#e2e8f0' } }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: data.map(d => d.value),
                    name: '当前能力',
                    areaStyle: { color: 'rgba(37, 99, 235, 0.2)' },
                    lineStyle: { color: '#2563eb', width: 2 },
                    itemStyle: { color: '#2563eb' },
                    symbol: 'circle',
                    symbolSize: 6
                }]
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

window.BloomRadar = BloomRadar;
