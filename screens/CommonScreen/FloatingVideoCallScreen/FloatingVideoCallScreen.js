import React from 'react';
import { useRoute } from '@react-navigation/native';
import FloatingVideoCall from '../../../components/FloatingVideoCall/FloatingVideoCall';

/**
 * Screen wrapper for FloatingVideoCall component
 * This allows FloatingVideoCall to receive route params when navigated to
 */
export default function FloatingVideoCallScreen() {
  // Get route from hook (we're in a screen, so this is safe)
  const route = useRoute();
  
  // Pass route as prop to FloatingVideoCall
  return <FloatingVideoCall route={route} />;
}

