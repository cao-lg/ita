/**
 * 恒信制造有限公司 2019-2020 年度财务数据集
 * 虚拟企业数据，仅供教学使用
 */

const HENGXIN_DATA = {
    // ===== 企业基本信息 =====
    companyInfo: {
        name: "恒信制造有限公司",
        shortName: "恒信制造",
        industry: "通用设备制造（工业自动化零部件）",
        founded: 2015,
        employees: 380,
        headquarters: "江苏省苏州市",
        fiscalYear: "2019-2020",
        stockCode: "拟上市",
        auditor: "天健会计师事务所",
        description: "恒信制造是一家成长型制造企业，2019年受贸易摩擦影响出口业务下滑，2020年通过转型内销和数字化改造实现逆势增长。"
    },

    // ===== 资产负债表 2019年末 =====
    balanceSheet2019: [
        { item: "货币资金", category: "流动资产", value2019: 2580000, value2020: 3120000 },
        { item: "交易性金融资产", category: "流动资产", value2019: 0, value2020: 0 },
        { item: "应收票据", category: "流动资产", value2019: 680000, value2020: 850000 },
        { item: "应收账款", category: "流动资产", value2019: 4250000, value2020: 5180000 },
        { item: "预付款项", category: "流动资产", value2019: 320000, value2020: 420000 },
        { item: "其他应收款", category: "流动资产", value2019: 150000, value2020: 180000 },
        { item: "存货", category: "流动资产", value2019: 3680000, value2020: 4020000 },
        { item: "流动资产合计", category: "流动资产", value2019: 11660000, value2020: 13970000 },
        { item: "固定资产", category: "非流动资产", value2019: 6200000, value2020: 7500000 },
        { item: "无形资产", category: "非流动资产", value2019: 980000, value2020: 1120000 },
        { item: "长期待摊费用", category: "非流动资产", value2019: 280000, value2020: 320000 },
        { item: "递延所得税资产", category: "非流动资产", value2019: 180000, value2020: 220000 },
        { item: "非流动资产合计", category: "非流动资产", value2019: 7640000, value2020: 9160000 },
        { item: "资产总计", category: "资产", value2019: 19300000, value2020: 23130000 },
        { item: "短期借款", category: "流动负债", value2019: 2800000, value2020: 3200000 },
        { item: "应付票据", category: "流动负债", value2019: 620000, value2020: 780000 },
        { item: "应付账款", category: "流动负债", value2019: 3280000, value2020: 3950000 },
        { item: "预收款项", category: "流动负债", value2019: 480000, value2020: 580000 },
        { item: "应付职工薪酬", category: "流动负债", value2019: 650000, value2020: 780000 },
        { item: "应交税费", category: "流动负债", value2019: 380000, value2020: 520000 },
        { item: "流动负债合计", category: "流动负债", value2019: 8210000, value2020: 9810000 },
        { item: "长期借款", category: "非流动负债", value2019: 1500000, value2020: 1350000 },
        { item: "递延所得税负债", category: "非流动负债", value2019: 120000, value2020: 140000 },
        { item: "非流动负债合计", category: "非流动负债", value2019: 1620000, value2020: 1490000 },
        { item: "负债合计", category: "负债", value2019: 9830000, value2020: 11300000 },
        { item: "实收资本", category: "所有者权益", value2019: 5000000, value2020: 5000000 },
        { item: "资本公积", category: "所有者权益", value2019: 800000, value2020: 950000 },
        { item: "盈余公积", category: "所有者权益", value2019: 1200000, value2020: 1480000 },
        { item: "未分配利润", category: "所有者权益", value2019: 2470000, value2020: 4400000 },
        { item: "所有者权益合计", category: "所有者权益", value2019: 9470000, value2020: 11830000 }
    ],

    // ===== 利润表 =====
    incomeStatement: [
        { item: "营业收入", y2019: 12990000, y2020: 19860000 },
        { item: "减：营业成本", y2019: 8440000, y2020: 12910000 },
        { item: "毛利", y2019: 4550000, y2020: 6950000 },
        { item: "减：销售费用", y2019: 1040000, y2020: 1590000 },
        { item: "减：管理费用", y2019: 1300000, y2020: 1990000 },
        { item: "减：财务费用", y2019: 260000, y2020: 400000 },
        { item: "减：研发费用", y2019: 580000, y2020: 890000 },
        { item: "营业利润", y2019: 1370000, y2020: 2080000 },
        { item: "加：营业外收入", y2019: 50000, y2020: 80000 },
        { item: "减：营业外支出", y2019: 30000, y2020: 50000 },
        { item: "利润总额", y2019: 1390000, y2020: 2110000 },
        { item: "减：所得税费用", y2019: 348000, y2020: 528000 },
        { item: "净利润", y2019: 1042000, y2020: 1582000 }
    ],

    // ===== 现金流量表 2020年 =====
    cashFlow2020: [
        { item: "销售商品、提供劳务收到的现金", category: "经营活动", amount: 20380000 },
        { item: "收到的税费返还", category: "经营活动", amount: 120000 },
        { item: "经营活动现金流入小计", category: "经营活动", amount: 20500000 },
        { item: "购买商品、接受劳务支付的现金", category: "经营活动", amount: 11850000 },
        { item: "支付给职工以及为职工支付的现金", category: "经营活动", amount: 5200000 },
        { item: "支付的各项税费", category: "经营活动", amount: 1850000 },
        { item: "支付其他与经营活动有关的现金", category: "经营活动", amount: 1280000 },
        { item: "经营活动现金流出小计", category: "经营活动", amount: 20180000 },
        { item: "经营活动产生的现金流量净额", category: "经营活动", amount: 320000 },
        { item: "收回投资收到的现金", category: "投资活动", amount: 0 },
        { item: "购建固定资产支付的现金", category: "投资活动", amount: 1850000 },
        { item: "投资活动现金流出小计", category: "投资活动", amount: 1850000 },
        { item: "投资活动产生的现金流量净额", category: "投资活动", amount: -1850000 },
        { item: "取得借款收到的现金", category: "筹资活动", amount: 1200000 },
        { item: "偿还债务支付的现金", category: "筹资活动", amount: 850000 },
        { item: "分配股利、利润支付的现金", category: "筹资活动", amount: 300000 },
        { item: "筹资活动现金流出小计", category: "筹资活动", amount: 1150000 },
        { item: "筹资活动产生的现金流量净额", category: "筹资活动", amount: 50000 },
        { item: "现金及现金等价物净增加额", category: "汇总", amount: -1480000 }
    ],

    // ===== 月度营收明细（24个月，单位：万元） =====
    monthlyRevenue: [
        { month: "2019-01", revenue: 82.0, cost: 53.3, profit: 28.7 },
        { month: "2019-02", revenue: 75.6, cost: 49.1, profit: 26.5 },
        { month: "2019-03", revenue: 91.0, cost: 59.2, profit: 31.8 },
        { month: "2019-04", revenue: 94.5, cost: 61.4, profit: 33.1 },
        { month: "2019-05", revenue: 102.0, cost: 66.3, profit: 35.7 },
        { month: "2019-06", revenue: 108.0, cost: 70.2, profit: 37.8 },
        { month: "2019-07", revenue: 115.0, cost: 74.8, profit: 40.2 },
        { month: "2019-08", revenue: 112.0, cost: 72.8, profit: 39.2 },
        { month: "2019-09", revenue: 125.0, cost: 81.3, profit: 43.7 },
        { month: "2019-10", revenue: 118.0, cost: 76.7, profit: 41.3 },
        { month: "2019-11", revenue: 132.0, cost: 85.8, profit: 46.2 },
        { month: "2019-12", revenue: 145.0, cost: 94.3, profit: 50.7 },
        { month: "2020-01", revenue: 138.0, cost: 89.7, profit: 48.3 },
        { month: "2020-02", revenue: 125.0, cost: 81.3, profit: 43.7 },
        { month: "2020-03", revenue: 142.0, cost: 92.3, profit: 49.7 },
        { month: "2020-04", revenue: 156.0, cost: 101.4, profit: 54.6 },
        { month: "2020-05", revenue: 168.0, cost: 109.2, profit: 58.8 },
        { month: "2020-06", revenue: 172.0, cost: 111.8, profit: 60.2 },
        { month: "2020-07", revenue: 165.0, cost: 107.3, profit: 57.7 },
        { month: "2020-08", revenue: 158.0, cost: 102.7, profit: 55.3 },
        { month: "2020-09", revenue: 175.0, cost: 113.8, profit: 61.2 },
        { month: "2020-10", revenue: 182.0, cost: 118.3, profit: 63.7 },
        { month: "2020-11", revenue: 195.0, cost: 126.8, profit: 68.2 },
        { month: "2020-12", revenue: 210.0, cost: 136.5, profit: 73.5 }
    ],

    // ===== 费用明细 2020年（单位：万元） =====
    expenseDetail2020: [
        { category: "人工费用", amount: 420, subCategory: "生产成本", pct: 21.2 },
        { category: "原材料", amount: 850, subCategory: "生产成本", pct: 42.8 },
        { category: "辅助材料", amount: 180, subCategory: "生产成本", pct: 9.1 },
        { category: "折旧费", amount: 95, subCategory: "制造费用", pct: 4.8 },
        { category: "水电费", amount: 125, subCategory: "制造费用", pct: 6.3 },
        { category: "办公费", amount: 65, subCategory: "管理费用", pct: 3.3 },
        { category: "差旅费", amount: 48, subCategory: "管理费用", pct: 2.4 },
        { category: "广告费", amount: 78, subCategory: "销售费用", pct: 3.9 },
        { category: "运输费", amount: 52, subCategory: "销售费用", pct: 2.6 },
        { category: "利息支出", amount: 40, subCategory: "财务费用", pct: 2.0 },
        { category: "其他", amount: 31, subCategory: "其他", pct: 1.6 }
    ],

    // ===== 科目余额表（2020年末，简化版） =====
    subjectBalances: [
        { code: "1001", name: "库存现金", type: "资产", beginningDebit: 50000, beginningCredit: 0, currentDebit: 1800000, currentCredit: 1750000, endingDebit: 100000, endingCredit: 0 },
        { code: "1002", name: "银行存款", type: "资产", beginningDebit: 2530000, beginningCredit: 0, currentDebit: 20500000, currentCredit: 20070000, endingDebit: 2960000, endingCredit: 0 },
        { code: "1012", name: "其他货币资金", type: "资产", beginningDebit: 0, beginningCredit: 0, currentDebit: 60000, currentCredit: 0, endingDebit: 60000, endingCredit: 0 },
        { code: "1121", name: "应收票据", type: "资产", beginningDebit: 680000, beginningCredit: 0, currentDebit: 5200000, currentCredit: 5030000, endingDebit: 850000, endingCredit: 0 },
        { code: "1122", name: "应收账款", type: "资产", beginningDebit: 4250000, beginningCredit: 0, currentDebit: 21800000, currentCredit: 20870000, endingDebit: 5180000, endingCredit: 0 },
        { code: "1123", name: "预付账款", type: "资产", beginningDebit: 320000, beginningCredit: 0, currentDebit: 1800000, currentCredit: 1700000, endingDebit: 420000, endingCredit: 0 },
        { code: "1221", name: "其他应收款", type: "资产", beginningDebit: 150000, beginningCredit: 0, currentDebit: 850000, currentCredit: 820000, endingDebit: 180000, endingCredit: 0 },
        { code: "1403", name: "原材料", type: "资产", beginningDebit: 1280000, beginningCredit: 0, currentDebit: 10850000, currentCredit: 10520000, endingDebit: 1610000, endingCredit: 0 },
        { code: "1405", name: "库存商品", type: "资产", beginningDebit: 1850000, beginningCredit: 0, currentDebit: 12580000, currentCredit: 12220000, endingDebit: 2210000, endingCredit: 0 },
        { code: "1408", name: "委托加工物资", type: "资产", beginningDebit: 550000, beginningCredit: 0, currentDebit: 3200000, currentCredit: 2950000, endingDebit: 200000, endingCredit: 0 },
        { code: "1601", name: "固定资产", type: "资产", beginningDebit: 6200000, beginningCredit: 0, currentDebit: 2150000, currentCredit: 850000, endingDebit: 7500000, endingCredit: 0 },
        { code: "1602", name: "累计折旧", type: "资产", beginningDebit: 0, beginningCredit: 1850000, currentDebit: 0, currentCredit: 950000, endingDebit: 0, endingCredit: 2800000 },
        { code: "1701", name: "无形资产", type: "资产", beginningDebit: 980000, beginningCredit: 0, currentDebit: 280000, currentCredit: 140000, endingDebit: 1120000, endingCredit: 0 },
        { code: "2001", name: "短期借款", type: "负债", beginningDebit: 0, beginningCredit: 2800000, currentDebit: 1500000, currentCredit: 1900000, endingDebit: 0, endingCredit: 3200000 },
        { code: "2201", name: "应付票据", type: "负债", beginningDebit: 0, beginningCredit: 620000, currentDebit: 3800000, currentCredit: 3960000, endingDebit: 0, endingCredit: 780000 },
        { code: "2202", name: "应付账款", type: "负债", beginningDebit: 0, beginningCredit: 3280000, currentDebit: 9850000, currentCredit: 10520000, endingDebit: 0, endingCredit: 3950000 },
        { code: "2203", name: "预收账款", type: "负债", beginningDebit: 0, beginningCredit: 480000, currentDebit: 3200000, currentCredit: 3300000, endingDebit: 0, endingCredit: 580000 },
        { code: "2211", name: "应付职工薪酬", type: "负债", beginningDebit: 0, beginningCredit: 650000, currentDebit: 5200000, currentCredit: 5330000, endingDebit: 0, endingCredit: 780000 },
        { code: "2221", name: "应交税费", type: "负债", beginningDebit: 0, beginningCredit: 380000, currentDebit: 2450000, currentCredit: 2590000, endingDebit: 0, endingCredit: 520000 },
        { code: "2501", name: "长期借款", type: "负债", beginningDebit: 0, beginningCredit: 1500000, currentDebit: 500000, currentCredit: 350000, endingDebit: 0, endingCredit: 1350000 },
        { code: "4001", name: "实收资本", type: "权益", beginningDebit: 0, beginningCredit: 5000000, currentDebit: 0, currentCredit: 0, endingDebit: 0, endingCredit: 5000000 },
        { code: "4103", name: "本年利润", type: "权益", beginningDebit: 0, beginningCredit: 1042000, currentDebit: 1042000, currentCredit: 1582000, endingDebit: 0, endingCredit: 1582000 },
        { code: "4104", name: "利润分配", type: "权益", beginningDebit: 0, beginningCredit: 1428000, currentDebit: 300000, currentCredit: 528000, endingDebit: 0, endingCredit: 1656000 }
    ],

    // ===== 脏数据（项目三清洗练习用） =====
    vouchersDirty: [
        { date: "2019/01/05", subject: " 库存现金 ", amount: "￥50,000.00", voucherNo: "PZ-2019-001", dept: "财务部" },
        { date: "2019-01-05", subject: "库存现金", amount: "50000", voucherNo: "PZ-2019-001", dept: "财务部" },
        { date: "2019.01.06", subject: "银行存款", amount: null, voucherNo: "PZ-2019-002", dept: "采购部" },
        { date: "2019/01/08", subject: " 应收账款 ", amount: "￥128,500.50", voucherNo: "PZ-2019-003", dept: "销售部" },
        { date: "2019-01-10", subject: "原材料", amount: "86,420.00", voucherNo: "PZ-2019-004", dept: "采购部" },
        { date: "2019/01/12", subject: "应付账款", amount: "￥62,800.00", voucherNo: "PZ-2019-005", dept: "采购部" },
        { date: "2019.01.15", subject: " 管理费用 ", amount: "12,560.00", voucherNo: "PZ-2019-006", dept: "行政部" },
        { date: "2019/01/18", subject: "销售费用", amount: "8,900.00", voucherNo: "PZ-2019-007", dept: "销售部" },
        { date: "2019-01-20", subject: " 银行存款 ", amount: "￥200,000.00", voucherNo: "PZ-2019-008", dept: "财务部" },
        { date: "2019/01/22", subject: "库存商品", amount: null, voucherNo: "PZ-2019-009", dept: "生产部" },
        { date: "2019.01.25", subject: "财务费用", amount: "3,200.00", voucherNo: "PZ-2019-010", dept: "财务部" },
        { date: "2019/01/28", subject: " 应付职工薪酬 ", amount: "￥156,000.00", voucherNo: "PZ-2019-011", dept: "人事部" },
        { date: "2019-01-30", subject: "应交税费", amount: "45,680.00", voucherNo: "PZ-2019-012", dept: "财务部" },
        { date: "2019/02/05", subject: " 原材料 ", amount: "￥98,750.00", voucherNo: "PZ-2019-013", dept: "采购部" },
        { date: "2019-02-08", subject: "银行存款", amount: "150,000.00", voucherNo: "PZ-2019-014", dept: "财务部" },
        { date: "2019.02.12", subject: " 应收账款 ", amount: null, voucherNo: "PZ-2019-015", dept: "销售部" }
    ],

    // ===== 清洗后数据（项目三答案参考） =====
    vouchersClean: [
        { date: "2019-01-05", subject: "库存现金", amount: 50000.00, voucherNo: "PZ-2019-001", dept: "财务部" },
        { date: "2019-01-06", subject: "银行存款", amount: 0, voucherNo: "PZ-2019-002", dept: "采购部" },
        { date: "2019-01-08", subject: "应收账款", amount: 128500.50, voucherNo: "PZ-2019-003", dept: "销售部" },
        { date: "2019-01-10", subject: "原材料", amount: 86420.00, voucherNo: "PZ-2019-004", dept: "采购部" },
        { date: "2019-01-12", subject: "应付账款", amount: 62800.00, voucherNo: "PZ-2019-005", dept: "采购部" },
        { date: "2019-01-15", subject: "管理费用", amount: 12560.00, voucherNo: "PZ-2019-006", dept: "行政部" },
        { date: "2019-01-18", subject: "销售费用", amount: 8900.00, voucherNo: "PZ-2019-007", dept: "销售部" },
        { date: "2019-01-20", subject: "银行存款", amount: 200000.00, voucherNo: "PZ-2019-008", dept: "财务部" },
        { date: "2019-01-22", subject: "库存商品", amount: 0, voucherNo: "PZ-2019-009", dept: "生产部" },
        { date: "2019-01-25", subject: "财务费用", amount: 3200.00, voucherNo: "PZ-2019-010", dept: "财务部" },
        { date: "2019-01-28", subject: "应付职工薪酬", amount: 156000.00, voucherNo: "PZ-2019-011", dept: "人事部" },
        { date: "2019-01-30", subject: "应交税费", amount: 45680.00, voucherNo: "PZ-2019-012", dept: "财务部" },
        { date: "2019-02-05", subject: "原材料", amount: 98750.00, voucherNo: "PZ-2019-013", dept: "采购部" },
        { date: "2019-02-08", subject: "银行存款", amount: 150000.00, voucherNo: "PZ-2019-014", dept: "财务部" },
        { date: "2019-02-12", subject: "应收账款", amount: 0, voucherNo: "PZ-2019-015", dept: "销售部" }
    ],

    // ===== 模拟爬虫HTML（项目二练习用） =====
    crawlerHtmlSample: `<!DOCTYPE html>
<html>
<head><title>巨潮资讯网 - 恒信制造2020年报</title></head>
<body>
<h1>恒信制造有限公司2020年年度报告</h1>
<div class="report-info">
    <p>股票代码：拟上市</p>
    <p>披露日期：2021-03-28</p>
    <p>报告期：2020-01-01至2020-12-31</p>
</div>
<div class="download-links">
    <a href="/hengxin/2020report.pdf">PDF全文下载</a>
    <a href="/hengxin/2020report.html">网页版</a>
</div>
<table class="financial-summary">
    <tr><th>项目</th><th>2020年</th><th>2019年</th></tr>
    <tr><td>营业收入</td><td>1,986.00</td><td>1,299.00</td></tr>
    <tr><td>净利润</td><td>158.20</td><td>104.20</td></tr>
</table>
</body>
</html>`,

    // ===== 辅助方法 =====
    toCSV(dataArray) {
        if (!dataArray || dataArray.length === 0) return '';
        const headers = Object.keys(dataArray[0]).join(',');
        const rows = dataArray.map(row => Object.values(row).join(',')).join('\n');
        return '\ufeff' + headers + '\n' + rows;
    },

    toJSON(dataArray) {
        return JSON.stringify(dataArray, null, 2);
    },

    // 获取数据集
    getDataset(key) {
        const map = {
            'balanceSheet2019': this.balanceSheet2019,
            'balanceSheet2020': this.balanceSheet2019, // 包含两年
            'incomeStatement': this.incomeStatement,
            'cashFlow2020': this.cashFlow2020,
            'monthlyRevenue': this.monthlyRevenue,
            'expenseDetail2020': this.expenseDetail2020,
            'subjectBalances': this.subjectBalances,
            'vouchersDirty': this.vouchersDirty,
            'vouchersClean': this.vouchersClean,
            'companyInfo': [this.companyInfo]
        };
        return map[key] || null;
    }
};

window.HENGXIN_DATA = HENGXIN_DATA;
