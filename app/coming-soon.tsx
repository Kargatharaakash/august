import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Edit, FileText, MessageCircle, ClipboardList } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import ComingSoon from '@/components/ComingSoon';

export default function ComingSoonScreen() {
  const { feature } = useLocalSearchParams();
  
  const getFeatureDetails = () => {
    switch (feature) {
      case 'edit':
        return {
          title: 'Edit Feature',
          description: 'Our advanced editing tools are coming soon. You\'ll be able to edit and manage your documents with ease.',
          icon: <Edit size={40} color={Colors.primary[600]} />
        };
      case 'wellness':
        return {
          title: 'Wellness',
          description: 'Track your health metrics and get personalized wellness recommendations.',
          icon: <FileText size={40} color={Colors.primary[600]} />
        };
      case 'health-records':
        return {
          title: 'Health Records',
          description: 'Securely store and access your medical records, lab results, and medication history all in one place.',
          icon: <ClipboardList size={40} color={Colors.primary[600]} />
        };
      default:
        return {
          title: 'Coming Soon',
          description: 'This feature is currently under development.',
          icon: <MessageCircle size={40} color={Colors.primary[600]} />
        };
    }
  };

  const { title, description, icon } = getFeatureDetails();

  return (
    <ComingSoon 
      title={title} 
      description={description}
      featureIcon={icon}
    />
  );
}