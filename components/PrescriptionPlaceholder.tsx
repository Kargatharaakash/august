import React from 'react';
import Svg, { Rect, Line, Path, Circle, Text as SvgText } from 'react-native-svg';

interface PrescriptionPlaceholderProps {
  width?: number;
  height?: number;
}

export default function PrescriptionPlaceholder({ width = 200, height = 200 }: PrescriptionPlaceholderProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      {/* Clipboard background */}
      <Rect x="40" y="20" width="120" height="160" rx="8" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2"/>
      
      {/* Clipboard top */}
      <Rect x="70" y="10" width="60" height="20" rx="5" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2"/>
      
      {/* Paper lines */}
      <Line x1="60" y1="50" x2="140" y2="50" stroke="#BDBDBD" strokeWidth="1"/>
      <Line x1="60" y1="70" x2="140" y2="70" stroke="#BDBDBD" strokeWidth="1"/>
      <Line x1="60" y1="90" x2="140" y2="90" stroke="#BDBDBD" strokeWidth="1"/>
      <Line x1="60" y1="110" x2="140" y2="110" stroke="#BDBDBD" strokeWidth="1"/>
      <Line x1="60" y1="130" x2="140" y2="130" stroke="#BDBDBD" strokeWidth="1"/>
      <Line x1="60" y1="150" x2="140" y2="150" stroke="#BDBDBD" strokeWidth="1"/>
      
      {/* Rx symbol */}
      <SvgText x="60" y="45" fontFamily="Arial" fontSize="18" fontWeight="bold" fill="#4CAF50">Rx</SvgText>
      
      {/* Camera icon */}
      <Circle cx="100" cy="100" r="25" fill="#4CAF50" fillOpacity="0.2"/>
      <Path d="M115 95H110L108 92H92L90 95H85C83.3431 95 82 96.3431 82 98V112C82 113.657 83.3431 115 85 115H115C116.657 115 118 113.657 118 112V98C118 96.3431 116.657 95 115 95Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="100" cy="105" r="8" stroke="#4CAF50" strokeWidth="2"/>
    </Svg>
  );
}