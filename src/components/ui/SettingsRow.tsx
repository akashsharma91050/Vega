import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, {ReactNode} from 'react';
import {Pressable, View} from 'react-native';
import {useM3Colors} from '../../theme/M3PaletteContext';
import AppText from './Text';

interface SettingsRowProps {
  title: string;
  description?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  trailing?: ReactNode;
  divider?: boolean;
}

const SettingsRow = ({
  title,
  description,
  icon,
  onPress,
  trailing,
  divider = true,
}: SettingsRowProps) => {
  const colors = useM3Colors();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      hitSlop={{top: 4, bottom: 4, left: 0, right: 0}}
      onPress={onPress}
      pressRetentionOffset={24}
      style={({pressed}) => ({
        backgroundColor: pressed ? colors.surfaceContainerHigh : 'transparent',
      })}>
      <View
        className="min-h-16 flex-row items-center px-4 py-3"
        style={{
          borderBottomColor: colors.outlineVariant,
          borderBottomWidth: divider ? 1 : 0,
        }}>
        {icon ? (
          <View
            className="mr-4 h-10 w-10 items-center justify-center rounded-full"
            style={{backgroundColor: colors.secondaryContainer}}>
            <MaterialCommunityIcons
              name={icon}
              size={21}
              color={colors.onSecondaryContainer}
              pointerEvents="none"
            />
          </View>
        ) : null}
        <View className="mr-3 flex-1">
          <AppText role="bodyLarge" className="text-m3-on-surface">
            {title}
          </AppText>
          {description ? (
            <AppText
              role="bodySmall"
              className="mt-1 text-m3-on-surface-variant">
              {description}
            </AppText>
          ) : null}
        </View>
        {trailing ??
          (onPress ? (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.onSurfaceVariant}
              pointerEvents="none"
            />
          ) : null)}
      </View>
    </Pressable>
  );
};

export default SettingsRow;
