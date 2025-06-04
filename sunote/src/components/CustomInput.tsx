import React from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface CustomInputProps extends TextInputProps {
  label: string;
  value: string;
  error?: string;
  multiline?: boolean;
}

const CustomInput = ({
  label,
  value,
  error,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline = false,
  numberOfLines = 1,
  ...rest
}: CustomInputProps) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.primary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: error ? theme.colors.error : theme.colors.outline,
            height: multiline ? 80 : 50,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.onSurface,
              height: multiline ? 70 : 45,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomInput; 