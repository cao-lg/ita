/**
 * SOLO层次分布图
 * 柱状图展示各层次答题量 + 折线图展示正确率
 */

const SoloDistribution = {
    chart: null,

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cp = Storage.getCognitiveProfile();
        if (!cp) {
            container.innerHTML = '<p class="empty-state-desc">暂无SOLO层次数据</p>';
            return;
        }

        const levels = ['S1', 'S2', 'S3', 'S4'];
        const names = ['单点结构', '多点结构', '关联结构', '抽象拓展'];
        const totals = levels.map(l => cp.soloTotals[l] || 0);
        const scores = levels.map(l => cp.soloScores[l] || 0);
        const rates = totals.map((t, i) => t > 0 ? Math.round((scores[i] / t) * 100) : 0);

        if (totals.every(t => t === 0)) {
            container.innerHTML = '<p class="empty-state-desc">暂无SOLO层次数据</p>';
            return;
        }

        container.style.height = '320px';
        container.style.width = '100%';

        if (!this.chart) {
            this.chart = echarts.init(container);
        }

        // 确定当前主要层次
        const maxTotal = Math.max(...totals);
        const dominantIdx = totals.indexOf(maxTotal);
        const nextLevel = dominantIdx < 3 ? names[dominantIdx + 1] : null;

        const option = {
            title: {
                text: 'SOLO学习层次分布',
                subtext: nextLevel ? `当前主要层次：${names[dominantIdx]} → 建议向「${nextLevel}」跃迁` : `当前主要层次：${names[dominantIdx]}（最高层）`,
                left: 'center',
                textStyle: { fontSize: 15, fontWeight: 600, color: '#1e293b' },
                subtextStyle: { fontSize: 12, color: '#2563eb' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['答题量', '正确率'],
                bottom: 0
            },
            grid: { left: '8%', right: '8%', bottom: '15%', top: '20%', containLabel: true },
            xAxis: {
                type: 'category',
                data: names,
                axisLabel: { color: '#475569', fontSize: 12 }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '答题量',
                    position: 'left',
                    axisLabel: { color: '#475569' },
                    splitLine: { lineStyle: { color: '#f1f5f9' } }
                },
                {
                    type: 'value',
                    name: '正确率',
                    position: 'right',
                    min: 0,
                    max: 100,
                    axisLabel: { formatter: '{value}%', color: '#475569' },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: '答题量',
                    type: 'bar',
                    data: totals,
                    itemStyle: {
                        color: (params) => {
                            const colors = ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8'];
                            return colors[params.dataIndex];
                        },
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '40%'
                },
                {
                    name: '正确率',
                    type: 'line',
                    yAxisIndex: 1,
                    data: rates,
                    itemStyle: { color: '#f59e0b' },
                    lineStyle: { width: 3 },
                    symbol: 'circle',
                    symbolSize: 8,
                    label: {
                        show: true,
                        formatter: '{c}%',
                        color: '#f59e0b',
                        fontWeight: 'bold'
                    }
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

window.SoloDistribution = SoloDistribution;
