import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';
import couponService from '../../../services/couponService';

const EditVoucherModal = ({ visible, onClose, onSuccess, voucher }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    couponCode: '',
    discountPercent: '',
    maxDiscount: '',
    quantity: '',
  });

  useEffect(() => {
    if (voucher && visible) {
      setFormData({
        couponCode: voucher.couponCode || '',
        discountPercent: voucher.discountPercent?.toString() || '',
        maxDiscount: voucher.maxDiscount?.toString() || '',
        quantity: voucher.quantity?.toString() || '',
      });
    }
  }, [voucher, visible]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatVND = (value) => {
    const number = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return number.toLocaleString('vi-VN');
  };

  const handleMaxDiscountChange = (value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    handleInputChange('maxDiscount', cleanValue);
  };

  const validateForm = () => {
    if (!formData.couponCode.trim()) {
      Alert.alert(t('manageVoucher.error'), t('manageVoucher.enterCouponCode'));
      return false;
    }
    if (!formData.discountPercent.trim()) {
      Alert.alert(t('manageVoucher.error'), t('manageVoucher.enterDiscountPercent'));
      return false;
    }
    const discount = parseInt(formData.discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      Alert.alert(t('manageVoucher.error'), t('manageVoucher.enterValidDiscountPercent'));
      return false;
    }
    if (!formData.maxDiscount.trim()) {
      Alert.alert(t('manageVoucher.error'), t('manageVoucher.enterMaxDiscount'));
      return false;
    }
    if (!formData.quantity.trim()) {
      Alert.alert(t('manageVoucher.error'), t('manageVoucher.enterQuantity'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Build payload with only changed fields
      const payload = {};
      
      // Coupon code (uppercase comparison)
      if (formData.couponCode.toUpperCase() !== voucher.couponCode) {
        payload.couponCode = formData.couponCode.toUpperCase();
      }
      
      // Discount percent
      if (parseInt(formData.discountPercent) !== voucher.discountPercent) {
        payload.discountPercent = parseInt(formData.discountPercent);
      }
      
      // Max discount
      if (parseInt(formData.maxDiscount) !== voucher.maxDiscount) {
        payload.maxDiscount = parseInt(formData.maxDiscount);
      }
      
      // Quantity
      if (parseInt(formData.quantity) !== voucher.quantity) {
        payload.quantity = parseInt(formData.quantity);
      }

      // Check if there are any changes
      if (Object.keys(payload).length === 0) {
        Alert.alert('No Changes', 'No changes were made to the voucher');
        onClose();
        return;
      }

      await couponService.updateCoupons(voucher.id, payload);
      Alert.alert(t('manageVoucher.success'), 'Voucher updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating voucher:', error);
      Alert.alert(t('manageVoucher.error'), 'Failed to update voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Voucher</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Coupon Code - Read Only */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('manageVoucher.couponCode')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>{formData.couponCode}</Text>
              </View>
              <Text style={styles.helperText}>Coupon code cannot be changed</Text>
            </View>

            {/* Discount Percent */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('manageVoucher.discountPercent')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter discount percentage (1-100)"
                  value={formData.discountPercent}
                  onChangeText={(value) => handleInputChange('discountPercent', value)}
                  keyboardType="numeric"
                  maxLength={3}
                  editable={!loading}
                />
                <View style={styles.inputIcon}>
                  <Ionicons name="percent" size={20} color="#999" />
                </View>
              </View>
            </View>

            {/* Max Discount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('manageVoucher.maxDiscount')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter max discount amount"
                value={formData.maxDiscount}
                onChangeText={handleMaxDiscountChange}
                keyboardType="numeric"
                editable={!loading}
              />
              {formData.maxDiscount && (
                <Text style={styles.vndDisplay}>
                  {formatVND(formData.maxDiscount)} ₫
                </Text>
              )}
            </View>

            {/* Quantity */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('manageVoucher.quantity')} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter total quantity"
                  value={formData.quantity}
                  onChangeText={(value) => handleInputChange('quantity', value)}
                  keyboardType="numeric"
                  editable={!loading}
                />
                <View style={styles.inputIcon}>
                  <Ionicons name="ticket" size={20} color="#999" />
                </View>
              </View>
              {voucher && (
                <Text style={styles.helperText}>
                  Currently used: {voucher.numberOfUsedCoupon} / {voucher.quantity}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>
                  {t('manageVoucher.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Update Voucher</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ED2A46',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
  },
  disabledText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  vndDisplay: {
    fontSize: 14,
    color: '#ED2A46',
    fontWeight: '600',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#ED2A46',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#fca5a5',
  },
});

export default EditVoucherModal;