import React from 'react';

export const SessionStatistics = ({ stats, t, StatCard, StatRow }) => {
  return (
    <StatCard title={t('trainingResults.sessions')} icon="calendar">
      <StatRow 
        label={t('trainingResults.totalSessions')} 
        value={stats.totalSessions} 
        icon="fitness-outline"
      />
      <StatRow 
        label={t('trainingResults.completedSessions')} 
        value={stats.completedSessions} 
        icon="checkmark-circle-outline"
        valueColor="#4CAF50"
      />
      <StatRow 
        label={t('trainingResults.cancelledSessions')} 
        value={stats.cancelledSessions} 
        icon="close-circle-outline"
        valueColor="#F44336"
      />
      <StatRow 
        label={t('trainingResults.upcomingSessions')} 
        value={stats.upcomingSessions} 
        icon="time-outline"
        valueColor="#2196F3"
      />
      <StatRow 
        label={t('trainingResults.availableSessions')} 
        value={stats.availableSessions} 
        icon="calendar-outline"
      />
      <StatRow 
        label={t('trainingResults.expirationDate')} 
        value={new Date(stats.expirationDate).toLocaleDateString()} 
        icon="flag-outline"
      />
      <StatRow 
        label={t('trainingResults.firstSessionStartTime')} 
        value={stats.firstSessionStartTime ? `${new Date(stats.firstSessionStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(stats.firstSessionStartTime).toLocaleDateString('en-GB')}` : t("customerDetail.notAvailable")} 
        icon="time-outline"
      />

      <StatRow 
        label={t('trainingResults.latestSessionEndTime')} 
        value={stats.latestSessionStartTime ? `${new Date(stats.latestSessionStartTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(stats.LatestSessionStartTime).toLocaleDateString('en-GB')}` : t("customerDetail.notAvailable")} 
        icon="time-outline"
      />
    </StatCard>
  );
};
