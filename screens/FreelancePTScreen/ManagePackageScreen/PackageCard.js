import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';

const PackageCard = ({ package: pkg, onPress, onEdit }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity 
      style={styles.packageCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Package Image */}
      {pkg.imageUrl && pkg.imageUrl !== 'string' && (
        <Image 
          source={{ uri: pkg.imageUrl }}
          style={styles.packageImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.packageContent}>
        <View style={styles.packageHeader}>
          <View style={styles.packageInfo}>
            <Text style={styles.packageName} numberOfLines={2}>{pkg.name}</Text>
            <Text style={styles.packageDescription} numberOfLines={2}>{pkg.description}</Text>
          </View>
        </View>

        <View style={styles.packageDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{pkg.durationInDays} {t('managePackage.days')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{pkg.sessionDurationInMinutes} {t('managePackage.minutes')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="barbell-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{pkg.numOfSessions} {t('managePackage.sessions')}</Text>
          </View>
        </View>

        <View style={styles.packageFooter}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>{t('managePackage.price')}</Text>
            <Text style={styles.priceValue}>{pkg.price?.toLocaleString('vi-VN')} ₫</Text>
          </View>
          <TouchableOpacity 
            style={styles.editIconButton}
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Ionicons name="pencil" size={18} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  packageImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  packageContent: {
    padding: 16,
  },
  packageHeader: {
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  packageDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ED2A46',
  },
  editIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PackageCard;
