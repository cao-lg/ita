/**
 * 数据表格渲染与 CSV/Excel 下载工具
 */

const DataDisplay = {
    /**
     * 渲染数据表格
     * @param {Array} dataArray - 数据行数组
     * @param {Array} columnsConfig - 列配置 [{key, label, width}]
     * @param {String} title - 表格标题
     */
    renderTable(dataArray, columnsConfig, title = '数据表格') {
        if (!dataArray || dataArray.length === 0) {
            return '<p style="color:var(--gray-400)">暂无数据</p>';
        }

        // 如果没有提供列配置，自动从第一条数据提取
        if (!columnsConfig || columnsConfig.length === 0) {
            columnsConfig = Object.keys(dataArray[0]).map(k => ({ key: k, label: k }));
        }

        const headers = columnsConfig.map(c =>
            `<th style="${c.width ? 'width:' + c.width : ''}">${c.label || c.key}</th>`
        ).join('');

        const rows = dataArray.map(row => {
            return '<tr>' + columnsConfig.map(c => {
                let val = row[c.key];
                // 格式化数值
                if (typeof val === 'number' && c.key !== 'code') {
                    if (Math.abs(val) >= 10000) {
                        val = val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                    } else if (Math.abs(val) >= 1) {
                        val = val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                    } else {
                        val = val.toFixed(2);
                    }
                }
                if (val === null || val === undefined) val = '-';
                return `<td>${val}</td>`;
            }).join('') + '</tr>';
        }).join('');

        const safeTitle = title.replace(/"/g, '&quot;');
        const datasetKey = this._inferDatasetKey(dataArray);

        return `
        <div class="data-table-section">
            <div class="data-table-header">
                <h4>${title}</h4>
                <div class="data-table-actions">
                    <button class="btn-sm btn-secondary" onclick="DataDisplay.downloadCSV('${datasetKey}', '${safeTitle}')">下载 CSV</button>
                    <button class="btn-sm btn-secondary" onclick="DataDisplay.downloadExcel('${datasetKey}', '${safeTitle}')">下载 Excel</button>
                </div>
            </div>
            <div class="table-scroll">
                <table class="content-table">
                    <thead><tr>${headers}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    },

    /**
     * 渲染完整数据区块（表格 + 下载按钮）
     * @param {String} datasetKey - HENGXIN_DATA 中的数据集key
     * @param {Object} config - { columns, title, filter }
     */
    renderDataBlock(datasetKey, config = {}) {
        const data = HENGXIN_DATA.getDataset(datasetKey);
        if (!data) return `<p style="color:var(--gray-400)">数据集 ${datasetKey} 不存在</p>`;

        let displayData = data;
        if (config.filter) {
            displayData = data.filter(config.filter);
        }

        // 特殊处理：资产负债表只需要某一年的数据
        if (datasetKey === 'balanceSheet2020' && config.year) {
            displayData = data.map(row => ({
                ...row,
                value: config.year === '2019' ? row.value2019 : row.value2020
            }));
        }

        return this.renderTable(displayData, config.columns, config.title);
    },

    /**
     * 下载 CSV
     */
    downloadCSV(datasetKey, filename) {
        const data = HENGXIN_DATA.getDataset(datasetKey);
        if (!data) { alert('数据集不存在'); return; }

        const csv = HENGXIN_DATA.toCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `恒信制造_${filename || datasetKey}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * 下载 Excel（复用 SheetJS）
     */
    downloadExcel(datasetKey, filename) {
        const data = HENGXIN_DATA.getDataset(datasetKey);
        if (!data) { alert('数据集不存在'); return; }
        if (typeof XLSX === 'undefined') { alert('Excel导出库未加载'); return; }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `恒信制造_${filename || datasetKey}.xlsx`);
    },

    /**
     * 根据数据内容推断数据集key（用于下载按钮）
     */
    _inferDatasetKey(dataArray) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return 'unknown';
        const first = dataArray[0];
        if ('value2019' in first && 'value2020' in first) return 'balanceSheet2019';
        if ('y2019' in first && 'y2020' in first) return 'incomeStatement';
        if ('month' in first && 'revenue' in first) return 'monthlyRevenue';
        if ('category' in first && 'amount' in first && 'subCategory' in first) return 'expenseDetail2020';
        if ('code' in first && 'name' in first && 'endingDebit' in first) return 'subjectBalances';
        if ('date' in first && 'voucherNo' in first) return 'vouchersDirty';
        if ('item' in first && 'category' in first && 'amount' in first) return 'cashFlow2020';
        return 'unknown';
    }
};

window.DataDisplay = DataDisplay;
