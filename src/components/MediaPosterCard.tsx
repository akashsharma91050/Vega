import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {Image, Pressable, View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useM3Colors} from '../theme/M3PaletteContext';
import AppText from './ui/Text';

interface MediaPosterCardProps {
  title: string;
  poster?: string;
  width: number;
  subtitle?: string;
  badge?: number | string;
  selected?: boolean;
  selectionMode?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const MediaPosterCard = ({
  title,
  poster,
  width,
  subtitle,
  badge,
  selected = false,
  selectionMode = false,
  onPress,
  onLongPress,
}: MediaPosterCardProps) => {
  const colors = useM3Colors();

  return (
    <Animated.View entering={FadeInDown.duration(280)} style={{width}}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        style={({pressed}) => ({
          opacity: pressed ? 0.86 : 1,
          transform: [{scale: pressed ? 0.96 : 1}],
          borderRadius: 22,
          backgroundColor: selected
            ? colors.primaryContainer
            : 'transparent',
          padding: selected ? 4 : 0,
        })}>
        <View
          style={{
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: 18,
            overflow: 'hidden',
            width: selected ? width - 8 : width,
            position: 'relative',
            borderWidth: selected ? 2 : 0,
            borderColor: selected ? colors.primary : 'transparent',
          }}>
          {badge != null ? (
            <View
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                backgroundColor: colors.primaryContainer,
                borderRadius: 8,
                paddingHorizontal: 7,
                paddingVertical: 2,
                zIndex: 5,
                borderWidth: 1,
                borderColor: colors.outlineVariant,
              }}>
              <AppText
                role="labelSmallEmphasized"
                style={{
                  color: colors.onPrimaryContainer,
                  fontWeight: '800',
                  fontSize: 11,
                }}>
                {badge}
              </AppText>
            </View>
          ) : null}

          {selectionMode ? (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                backgroundColor: selected ? colors.primary : 'rgba(0,0,0,0.55)',
                borderRadius: 12,
                width: 22,
                height: 22,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                borderWidth: 1,
                borderColor: selected ? colors.primary : 'rgba(255,255,255,0.6)',
              }}>
              {selected ? (
                <MaterialCommunityIcons
                  name="check"
                  size={14}
                  color={colors.onPrimary}
                />
              ) : null}
            </View>
          ) : null}

          {poster ? (
            <Image
              source={{uri: poster}}
              resizeMode="cover"
              style={{aspectRatio: 2 / 3, width: selected ? width - 8 : width}}
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                aspectRatio: 2 / 3,
                backgroundColor: colors.surfaceContainerHighest,
                justifyContent: 'center',
                width: selected ? width - 8 : width,
              }}>
              <AppText
                role="headlineMediumEmphasized"
                style={{color: colors.onSurfaceVariant}}>
                {title.slice(0, 1).toUpperCase()}
              </AppText>
            </View>
          )}
        </View>
        <AppText
          role="labelMediumEmphasized"
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{
            color: selected ? colors.onPrimaryContainer : colors.onSurface,
            marginTop: selected ? 4 : 7,
            paddingHorizontal: selected ? 2 : 0,
          }}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            role="labelSmall"
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{
              color: selected
                ? colors.onPrimaryContainer
                : colors.onSurfaceVariant,
              marginTop: 1,
              paddingHorizontal: selected ? 2 : 0,
            }}>
            {subtitle}
          </AppText>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

export default MediaPosterCard;
