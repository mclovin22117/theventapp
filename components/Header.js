// components/Header.js
import React from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

import AppLogo from '../assets/ventlogo.png';

const Header = ({ 
  showLogo = true, 
  logoSource = AppLogo, 
  tagline, 
  headerBgColor, 
  headerTextColor, 
  taglineFontSize, 
  centerTagline,
  showMenu = false,
  onMenuPress 
}) => {
  const { colors } = useTheme();

  const currentHeaderBg = headerBgColor || colors.primary;
  const currentHeaderTextColor = headerTextColor || colors.card;
  const currentTaglineFontSize = taglineFontSize || 20;

  return (
    <View style={[styles.headerContainer, { backgroundColor: currentHeaderBg }]}>
      {showLogo && logoSource && (
        <Image
          source={logoSource}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <View style={styles.textContainer}>
        {tagline && (
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.taglineText, { color: currentHeaderTextColor, fontSize: currentTaglineFontSize }]}>
            {tagline}
          </Text>
        )}
      </View>
      {showMenu && onMenuPress && (
        <TouchableOpacity 
          onPress={onMenuPress}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu" size={24} color={currentHeaderTextColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taglineText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  menuButton: {
    padding: 4,
  },
});

export default Header;