import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  Host,
  Shape,
  Text,
  TextField,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import {fillMaxWidth} from '@expo/ui/jetpack-compose/modifiers';
import React, {useState} from 'react';
import {ToastAndroid, View} from 'react-native';
import {settingsStorage} from '../../../lib/storage';
import {
  DOH_PROVIDERS,
  DohProviderValue,
  syncDohSettings,
} from '../../../lib/services/dohService';
import {useM3Colors, useM3HostTheme} from '../../../theme/M3PaletteContext';
import AppText from '../../../components/ui/Text';
import DropdownField from '../../../components/ui/DropdownField';

const DnsPreference = () => {
  const colors = useM3Colors();
  const hostTheme = useM3HostTheme();
  const initialProvider = settingsStorage.isDohEnabled()
    ? (settingsStorage.getDohProvider() as DohProviderValue)
    : 'off';
  const [provider, setProvider] = useState<DohProviderValue>(initialProvider);
  const [customUrl, setCustomUrl] = useState(settingsStorage.getDohCustomUrl());
  const customUrlValue = useNativeState(customUrl);

  const selectProvider = async (value: DohProviderValue) => {
    setProvider(value);
    settingsStorage.setDohEnabled(value !== 'off');
    if (value !== 'off') {
      settingsStorage.setDohProvider(value);
    }
    await syncDohSettings();
  };

  const saveCustomUrl = async (value: string) => {
    settingsStorage.setDohCustomUrl(value);
    await syncDohSettings();
    ToastAndroid.show('Custom DNS applied', ToastAndroid.SHORT);
  };

  return (
    <View className="p-4">
      <View className="mb-3 flex-row items-center">
        <View
          className="mr-4 h-10 w-10 items-center justify-center rounded-full"
          style={{backgroundColor: colors.secondaryContainer}}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={21}
            color={colors.onSecondaryContainer}
          />
        </View>
        <View className="flex-1">
          <AppText role="bodyLarge" className="text-m3-on-surface">
            DNS over HTTPS
          </AppText>
          <AppText
            role="bodySmall"
            className="mt-0.5 text-m3-on-surface-variant">
            Encrypt DNS queries with secure resolver
          </AppText>
        </View>
      </View>

      <DropdownField
        options={DOH_PROVIDERS}
        value={DOH_PROVIDERS.find(option => option.value === provider)}
        getKey={option => option.value}
        getLabel={option => option.label}
        onChange={option => selectProvider(option.value)}
      />

      {provider === 'custom' ? (
        <View
          style={{
            borderTopColor: colors.outlineVariant,
            borderTopWidth: 1,
            marginTop: 14,
            paddingTop: 14,
          }}>
          <AppText
            role="labelMedium"
            style={{color: colors.onSurfaceVariant, marginBottom: 8}}>
            Custom DoH URL
          </AppText>
          <Host
            matchContents={{vertical: true}}
            style={{width: '100%'}}
            {...hostTheme}>
            <TextField
              value={customUrlValue}
              singleLine
              onValueChange={setCustomUrl}
              keyboardOptions={{
                autoCorrectEnabled: false,
                capitalization: 'none',
                imeAction: 'done',
                keyboardType: 'uri',
              }}
              keyboardActions={{onDone: saveCustomUrl}}
              modifiers={[fillMaxWidth()]}
              shape={Shape.RoundedCorner({
                cornerRadii: {
                  topStart: 16,
                  topEnd: 16,
                  bottomStart: 16,
                  bottomEnd: 16,
                },
              })}
              textStyle={{fontSize: 14, color: colors.onSurface}}
              colors={{
                focusedContainerColor: colors.surfaceContainerHigh,
                unfocusedContainerColor: colors.surfaceContainerHigh,
                focusedTextColor: colors.onSurface,
                unfocusedTextColor: colors.onSurface,
                cursorColor: colors.primary,
                focusedIndicatorColor: 'transparent',
                unfocusedIndicatorColor: 'transparent',
                focusedPlaceholderColor: colors.onSurfaceVariant,
                unfocusedPlaceholderColor: colors.onSurfaceVariant,
              }}>
              <TextField.Placeholder>
                <Text color={colors.onSurfaceVariant}>
                  https://dns.example.com/dns-query
                </Text>
              </TextField.Placeholder>
            </TextField>
          </Host>
        </View>
      ) : null}
    </View>
  );
};

export default DnsPreference;
