/**
 * 内容增强器 - 注入情境故事、渲染数据表格、嵌入代码数据
 */

const STORIES = {
    p1: {
        title: "项目一：入职第一天",
        content: "你作为恒信制造财务部新入职的数据分析实习生，第一天报到。财务总监李总要求你一周内搭建好Python数据分析环境，并开发一个\"会计分录自动打印\"小工具，用于后续大量凭证的批量处理。",
        meta: "恒信制造有限公司 · 财务部 · 2020年3月"
    },
    p2: {
        title: "项目二：IPO数据收集",
        content: "李总需要你收集同行业可比公司数据，用于撰写IPO招股书行业对比章节。你需要通过Tushare获取3家上市公司数据，并编写爬虫从巨潮资讯网下载年报PDF。",
        meta: "恒信制造有限公司 · 财务总监办公室 · 2020年4月"
    },
    p3: {
        title: "项目三：数据清洗攻坚",
        content: "从ERP导出的原始数据质量堪忧：金额混有￥和逗号、日期格式不统一、存在重复凭证。你需要清洗这些数据，输出标准化数据集，为后续分析做准备。",
        meta: "恒信制造有限公司 · 数据分析室 · 2020年5月"
    },
    p4: {
        title: "项目四：经营分析",
        content: "清洗后的数据已就绪。李总要求你完成2019-2020年度描述性统计分析，重点分析营收趋势、成本结构、四大财务能力指标（盈利能力、偿债能力、营运能力、发展能力）。",
        meta: "恒信制造有限公司 · 数据分析室 · 2020年6月"
    },
    p5: {
        title: "项目五：董事会汇报",
        content: "数据分析结果需要向董事会汇报。李总要求你制作一套专业财务可视化看板，包含趋势图、饼图、对比图，最终输出HTML格式的看板文件。",
        meta: "恒信制造有限公司 · 会议室 · 2020年7月"
    },
    p6: {
        title: "项目六：年度报告编制",
        content: "年终董事会即将召开，李总要求你整合前五个项目成果，编制《恒信制造2019-2020年度经营数据分析报告》，包含数据获取说明、清洗记录、统计结论、可视化图表、经营诊断与改进建议。",
        meta: "恒信制造有限公司 · 总经理办公室 · 2020年8月"
    }
};

// 代码数据映射
const CODE_DATA_MAP = {
    'annualRevenue2019': '12990000',
    'annualRevenue2020': '19860000',
    'annualCost2020': '12910000',
    'netProfit2020': '1582000',
    'totalAssets2020': '23130000',
    'totalLiabilities2020': '11300000',
    'equity2020': '11830000',
    'monthlyRevenueList': '[82.0, 75.6, 91.0, 94.5, 102.0, 108.0, 115.0, 112.0, 125.0, 118.0, 132.0, 145.0, 138.0, 125.0, 142.0, 156.0, 168.0, 172.0, 165.0, 158.0, 175.0, 182.0, 195.0, 210.0]',
    'monthlyRevenue2019List': '[82.0, 75.6, 91.0, 94.5, 102.0, 108.0, 115.0, 112.0, 125.0, 118.0, 132.0, 145.0]',
    'monthlyRevenue2020List': '[138.0, 125.0, 142.0, 156.0, 168.0, 172.0, 165.0, 158.0, 175.0, 182.0, 195.0, 210.0]',
    'expenseCategories': '["人工费用", "原材料", "辅助材料", "折旧费", "水电费", "办公费", "差旅费", "广告费", "运输费", "利息支出", "其他"]',
    'expenseAmounts': '[420, 850, 180, 95, 125, 65, 48, 78, 52, 40, 31]',
    'subjectCodes': '["1001", "1002", "1122", "1403", "1601", "2001", "2202", "4001"]',
    'subjectNames': '["库存现金", "银行存款", "应收账款", "原材料", "固定资产", "短期借款", "应付账款", "实收资本"]',
    'fixedAssetValue': '7500000',
    'depreciationRate': '0.20',
    'grossMargin2020': '0.35',
    'debtRatio2020': '0.4885',
    'netMargin2020': '0.0797',
    'roe2020': '0.1337',
    'inventoryValue': '4020000',
    'receivablesValue': '5180000',
    'companyName': '"恒信制造有限公司"',
    'crawlerUrl': '"http://www.cninfo.com.cn/hengxin/2020report.pdf"',
    'employeeCount': '380'
};

const ContentEnhancer = {
    /**
     * 注入情境故事框
     */
    injectStory(html, projectId) {
        const story = STORIES[projectId];
        if (!story) return html;

        const storyHtml = `
        <div class="story-box">
            <h4>${story.title}</h4>
            <p>${story.content}</p>
            <div class="story-meta">${story.meta}</div>
        </div>`;

        // 替换 <!--STORY--> 占位符，如果没有则在开头插入
        if (html.includes('<!--STORY-->')) {
            return html.replace('<!--STORY-->', storyHtml);
        }
        return storyHtml + html;
    },

    /**
     * 渲染数据表格占位符
     */
    renderDataTables(html) {
        // 匹配 <!--TABLE:datasetKey:config-->
        return html.replace(/<!--TABLE:([\w]+)(?::([^>]*))?-->/g, (match, datasetKey, configStr) => {
            const config = this._parseTableConfig(datasetKey, configStr);
            return DataDisplay.renderDataBlock(datasetKey, config);
        });
    },

    /**
     * 嵌入代码数据占位符
     */
    injectCodeData(html, taskId) {
        // 匹配 <!--CODE_DATA:key-->
        return html.replace(/<!--CODE_DATA:([\w]+)-->/g, (match, key) => {
            const value = CODE_DATA_MAP[key];
            return value !== undefined ? value : match;
        });
    },

    /**
     * 解析表格配置
     */
    _parseTableConfig(datasetKey, configStr) {
        const defaults = {
            balanceSheet2019: {
                columns: [
                    { key: 'item', label: '项目', width: '200px' },
                    { key: 'category', label: '类别', width: '100px' },
                    { key: 'value2019', label: '2019年末(元)', width: '140px' },
                    { key: 'value2020', label: '2020年末(元)', width: '140px' }
                ],
                title: '恒信制造有限公司 资产负债表'
            },
            incomeStatement: {
                columns: [
                    { key: 'item', label: '项目', width: '200px' },
                    { key: 'y2019', label: '2019年(元)', width: '140px' },
                    { key: 'y2020', label: '2020年(元)', width: '140px' }
                ],
                title: '恒信制造有限公司 利润表'
            },
            cashFlow2020: {
                columns: [
                    { key: 'item', label: '项目', width: '280px' },
                    { key: 'category', label: '类别', width: '100px' },
                    { key: 'amount', label: '金额(元)', width: '140px' }
                ],
                title: '恒信制造有限公司 2020年现金流量表'
            },
            monthlyRevenue: {
                columns: [
                    { key: 'month', label: '月份', width: '100px' },
                    { key: 'revenue', label: '营业收入(万元)', width: '130px' },
                    { key: 'cost', label: '营业成本(万元)', width: '130px' },
                    { key: 'profit', label: '毛利(万元)', width: '120px' }
                ],
                title: '恒信制造有限公司 月度营收明细'
            },
            expenseDetail2020: {
                columns: [
                    { key: 'category', label: '费用项目', width: '120px' },
                    { key: 'subCategory', label: '归属', width: '100px' },
                    { key: 'amount', label: '金额(万元)', width: '120px' },
                    { key: 'pct', label: '占比(%)', width: '100px' }
                ],
                title: '恒信制造有限公司 2020年费用明细'
            },
            subjectBalances: {
                columns: [
                    { key: 'code', label: '科目编码', width: '90px' },
                    { key: 'name', label: '科目名称', width: '120px' },
                    { key: 'type', label: '类别', width: '80px' },
                    { key: 'endingDebit', label: '期末借方(元)', width: '130px' },
                    { key: 'endingCredit', label: '期末贷方(元)', width: '130px' }
                ],
                title: '恒信制造有限公司 科目余额表(2020年末)'
            },
            vouchersDirty: {
                columns: [
                    { key: 'date', label: '日期', width: '120px' },
                    { key: 'voucherNo', label: '凭证号', width: '120px' },
                    { key: 'subject', label: '科目', width: '150px' },
                    { key: 'amount', label: '金额', width: '140px' },
                    { key: 'dept', label: '部门', width: '100px' }
                ],
                title: '恒信制造 ERP导出原始凭证数据（待清洗）'
            },
            vouchersClean: {
                columns: [
                    { key: 'date', label: '日期', width: '120px' },
                    { key: 'voucherNo', label: '凭证号', width: '120px' },
                    { key: 'subject', label: '科目', width: '150px' },
                    { key: 'amount', label: '金额(元)', width: '140px' },
                    { key: 'dept', label: '部门', width: '100px' }
                ],
                title: '恒信制造 清洗后凭证数据'
            }
        };

        return defaults[datasetKey] || { title: '数据表格', columns: [] };
    }
};

window.ContentEnhancer = ContentEnhancer;
