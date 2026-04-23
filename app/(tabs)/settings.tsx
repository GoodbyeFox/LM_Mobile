import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { useLMStudio } from '@/context/LMStudioContext';

export default function SettingsScreen() {
  const { config, isConfigured, isLoading, setConfig, clearConfig, testConnection } = useLMStudio();
  const [baseURL, setBaseURL] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (config) {
      setBaseURL(config.baseURL);
      setApiKey(config.apiKey || '');
    }
  }, [config]);

  const handleSave = async () => {
    if (!baseURL.trim()) {
      Alert.alert('Error', 'Please enter a server URL');
      return;
    }

    try {
      await setConfig({
        baseURL: baseURL.trim(),
        apiKey: apiKey.trim() || undefined,
      });
      Alert.alert('Success', 'Configuration saved successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save configuration');
    }
  };

  const handleTestConnection = async () => {
    if (!baseURL.trim()) {
      Alert.alert('Error', 'Please enter a server URL');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Test with the input values first
      const testService = require('@/services/lmStudioService').LMStudioService;
      const service = new testService(baseURL.trim(), apiKey.trim() || undefined);
      const isConnected = await service.testConnection();

      if (isConnected) {
        setConnectionStatus('success');
        Alert.alert('Success', 'Connected to LM Studio successfully!');
      } else {
        setConnectionStatus('error');
        Alert.alert('Error', 'Failed to connect to LM Studio');
      }
    } catch (error) {
      setConnectionStatus('error');
      Alert.alert('Error', error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearConfig = () => {
    Alert.alert('Clear Configuration', 'Are you sure you want to clear the configuration?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Clear',
        onPress: async () => {
          try {
            await clearConfig();
            setBaseURL('');
            setApiKey('');
            setConnectionStatus('idle');
            Alert.alert('Success', 'Configuration cleared');
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to clear configuration');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LM Studio Connection</Text>
        <Text style={styles.description}>
          Configure your LM Studio server connection to start using the app.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            placeholder="http://localhost:1234"
            value={baseURL}
            onChangeText={setBaseURL}
            editable={!isTestingConnection}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>e.g., http://localhost:1234 or https://api.example.com</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>API Key (Optional)</Text>
          <View style={styles.apiKeyContainer}>
            <TextInput
              style={[styles.input, styles.apiKeyInput]}
              placeholder="Leave empty if not required"
              value={apiKey}
              onChangeText={setApiKey}
              editable={!isTestingConnection}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowApiKey(!showApiKey)}>
              <Text style={styles.toggleButtonText}>{showApiKey ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>API key for authentication (if required)</Text>
        </View>

        <View style={styles.statusContainer}>
          {connectionStatus === 'success' && (
            <View style={styles.statusSuccess}>
              <Text style={styles.statusText}>✓ Connected</Text>
            </View>
          )}
          {connectionStatus === 'error' && (
            <View style={styles.statusError}>
              <Text style={styles.statusText}>✗ Connection Failed</Text>
            </View>
          )}
          {isConfigured && connectionStatus === 'idle' && (
            <View style={styles.statusConfigured}>
              <Text style={styles.statusText}>● Configured</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestConnection}
          disabled={isTestingConnection}>
          {isTestingConnection ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.testButtonText}>Test Connection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={!baseURL.trim() || isTestingConnection}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>

        {isConfigured && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearConfig}
            disabled={isTestingConnection}>
            <Text style={styles.clearButtonText}>Clear Configuration</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          This app uses the LM Studio REST API v1 to communicate with your local LM Studio instance.
        </Text>
        <Text style={styles.aboutText}>
          For more information, visit the LM Studio documentation at https://lmstudio.ai
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiKeyInput: {
    flex: 1,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  toggleButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  statusContainer: {
    marginTop: 16,
  },
  statusSuccess: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34c759',
  },
  statusError: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  statusConfigured: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});
