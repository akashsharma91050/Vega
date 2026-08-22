import {View, ScrollView} from 'react-native';
import React from 'react';
import {startActivityAsync, ActivityAction} from 'expo-intent-launcher';
import {settingsStorage} from '../../lib/storage';
import IconButton from '../../components/ui/IconButton';
import SettingsRow from '../../components/ui/SettingsRow';
import SettingsSection from '../../components/ui/SettingsSection';
import AppText from '../../components/ui/Text';

const SubtitlePreference = () => {
  const [fontSize, setFontSize] = React.useState(
    settingsStorage.getSubtitleFontSize(),
  );
  const [opacity, setOpacity] = React.useState(
    settingsStorage.getSubtitleOpacity(),
  );
  const [bottomElevation, setBottomElevation] = React.useState(
    settingsStorage.getSubtitleBottomPadding(),
  );
  const handleSubtitleSize = (action: 'increase' | 'decrease') => {
    if (fontSize < 5 || fontSize > 30) return;
    if (action === 'increase') {
      const newSize = Math.min(fontSize + 1, 30);
      settingsStorage.setSubtitleFontSize(newSize);
      setFontSize(newSize);
    }
    if (action === 'decrease') {
      const newSize = Math.max(fontSize - 1, 10);
      settingsStorage.setSubtitleFontSize(newSize);
      setFontSize(newSize);
    }
  };

  const handleSubtitleOpacity = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      const newOpacity = Math.min(opacity + 0.1, 1).toFixed(1);
      settingsStorage.setSubtitleOpacity(parseFloat(newOpacity));
      setOpacity(parseFloat(newOpacity));
    }
    if (action === 'decrease') {
      const newOpacity = Math.max(opacity - 0.1, 0).toFixed(1);
      settingsStorage.setSubtitleOpacity(parseFloat(newOpacity));
      setOpacity(parseFloat(newOpacity));
    }
  };

  const handleSubtitleBottomPadding = (action: 'increase' | 'decrease') => {
    if (bottomElevation < 0 || bottomElevation > 99) return;
    if (action === 'increase') {
      const newPadding = Math.min(bottomElevation + 1, 99);
      settingsStorage.setSubtitleBottomPadding(newPadding);
      setBottomElevation(newPadding);
    }
    if (action === 'decrease') {
      const newPadding = Math.max(bottomElevation - 1, 0);
      settingsStorage.setSubtitleBottomPadding(newPadding);
      setBottomElevation(newPadding);
    }
  };

  return (
    <ScrollView
      className="h-full w-full bg-m3-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: 40, paddingTop: 20}}>
      <View className="px-5">
        <AppText
          role="headlineLargeEmphasized"
          className="text-m3-on-background">
          Subtitle Preferences
        </AppText>
        <AppText
          role="bodyLarge"
          className="mb-7 mt-1 text-m3-on-surface-variant">
          Tune subtitle readability for your player
        </AppText>

        <SettingsSection title="Text">
          <SettingsRow
            title="Font size"
            description="Size in scaled pixels"
            trailing={
              <View className="flex-row items-center gap-2">
                <IconButton
                  icon="minus"
                  label="Decrease subtitle font size"
                  onPress={() => handleSubtitleSize('decrease')}
                />
                <AppText
                  role="titleMediumEmphasized"
                  className="w-10 text-center text-m3-on-surface">
                  {fontSize}
                </AppText>
                <IconButton
                  icon="plus"
                  label="Increase subtitle font size"
                  onPress={() => handleSubtitleSize('increase')}
                />
              </View>
            }
          />
          <SettingsRow
            title="Opacity"
            description="Subtitle background opacity"
            trailing={
              <View className="flex-row items-center gap-2">
                <IconButton
                  icon="minus"
                  label="Decrease subtitle opacity"
                  onPress={() => handleSubtitleOpacity('decrease')}
                />
                <AppText
                  role="titleMediumEmphasized"
                  className="w-10 text-center text-m3-on-surface">
                  {opacity}
                </AppText>
                <IconButton
                  icon="plus"
                  label="Increase subtitle opacity"
                  onPress={() => handleSubtitleOpacity('increase')}
                />
              </View>
            }
          />
          <SettingsRow
            title="Bottom elevation"
            description="Distance from the bottom edge"
            trailing={
              <View className="flex-row items-center gap-2">
                <IconButton
                  icon="minus"
                  label="Decrease subtitle bottom elevation"
                  onPress={() => handleSubtitleBottomPadding('decrease')}
                />
                <AppText
                  role="titleMediumEmphasized"
                  className="w-10 text-center text-m3-on-surface">
                  {bottomElevation}
                </AppText>
                <IconButton
                  icon="plus"
                  label="Increase subtitle bottom elevation"
                  onPress={() => handleSubtitleBottomPadding('increase')}
                />
              </View>
            }
          />
          <SettingsRow
            title="System caption settings"
            description="Open Android accessibility caption controls"
            icon="closed-caption-outline"
            onPress={async () => {
              await startActivityAsync(ActivityAction.CAPTIONING_SETTINGS);
            }}
          />
          <SettingsRow
            title="Reset to defaults"
            description="Font 16, full opacity, elevation 10"
            divider={false}
            trailing={
              <IconButton
                icon="restore"
                label="Reset subtitle preferences"
                onPress={() => {
                  settingsStorage.setSubtitleFontSize(16);
                  settingsStorage.setSubtitleOpacity(1);
                  settingsStorage.setSubtitleBottomPadding(10);
                  setFontSize(16);
                  setOpacity(1);
                  setBottomElevation(10);
                }}></IconButton>
            }
          />
        </SettingsSection>
      </View>
    </ScrollView>
  );
};

export default SubtitlePreference;
