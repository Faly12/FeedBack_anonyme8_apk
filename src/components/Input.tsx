import { TextInput, View, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme/AppThemeContext';

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
};

export function Input({ label, placeholder, value, onChangeText, secureTextEntry, style, inputStyle }: InputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={theme.inputPlaceholder}
        style={[
          styles.input,
          { backgroundColor: theme.surface, borderColor: theme.borderStrong, color: theme.text },
          inputStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
});
