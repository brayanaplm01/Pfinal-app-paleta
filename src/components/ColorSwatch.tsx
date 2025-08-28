import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getContrastColor } from '../utils/colorUtils';

interface ColorSwatchProps {
  color: string;
  size?: number;
  showHex?: boolean;
  onPress?: (color: string) => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 60,
  showHex = false,
  onPress
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(color);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.swatch,
        {
          backgroundColor: color,
          width: size,
          height: size,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {showHex && (
        <Text
          style={[
            styles.hexText,
            { color: getContrastColor(color) }
          ]}
        >
          {color.toUpperCase()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  swatch: {
    borderRadius: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  hexText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});
