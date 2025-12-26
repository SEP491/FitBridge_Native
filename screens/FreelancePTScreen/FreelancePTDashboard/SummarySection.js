import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";

import { mockedDataDashboard } from "./mockedDataDashboard";
import SummaryCard from "../../../components/SummaryCards/SummaryCard";
import PerformanceSummaryCard from "../../../components/SummaryCards/PerformanceSummaryCard";
import RevenueSummaryCard from "../../../components/SummaryCards/RevenueSummaryCard";
// import SessionStatusCard from "../../../components/SummaryCards/SessionStatusCard";

const chunkArray = (items = [], chunkSize = 2) => {
  if (!items.length || chunkSize <= 0) return [];
  const result = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize));
  }
  return result;
};

const SummarySection = ({
  summaryFinancialStats,
  summaryPerformanceStats,
  formatCurrency,
  renderRevenueComparison,
  monthLyRevenue,
  onRefresh,
}) => {
  const performanceStatRows = useMemo(
    () => chunkArray(summaryPerformanceStats, 2),
    [summaryPerformanceStats]
  );

  return (
    <View style={styles.summarySection}>
      {/* Row 1: Financial Stats */}
      <View style={styles.financialRow}>
        {summaryFinancialStats.map((stat) => (
          <SummaryCard stat={stat} key={stat.id} />
        ))}
      </View>

      {/* Row 2: Performance Stats */}
      <View style={styles.performanceRowsWrapper}>
        {performanceStatRows.map((row, rowIndex) => (
          <View style={styles.performanceRow} key={`performance-row-${rowIndex}`}>
            {row.map((stat) => (
              <PerformanceSummaryCard stat={stat} key={stat.id} />
            ))}
            {row.length === 1 && <View style={styles.performanceCardSpacer} />}
          </View>
        ))}
      </View>

      {/* Row 3: Revenue & Session Status Chart */}
      <View style={styles.revenueChartRow}>
        <RevenueSummaryCard
          totalRevenue={monthLyRevenue?.totalRevenue || 0}
          compareToLastMonth={monthLyRevenue?.compareWithLastMonth || null}
          formatCurrency={formatCurrency}
          renderRevenueComparison={renderRevenueComparison}
        />

          {/* <SessionStatusCard statusReport={sessionStatusReport} /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  financialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  performanceRowsWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  performanceRow: {
    flexDirection: "row",
    gap: 8,
  },
  performanceCardSpacer: {
    flex: 1,
  },
  revenueChartRow: {
    flexDirection: "row",
    gap: 12,
  },
});

export default SummarySection;
