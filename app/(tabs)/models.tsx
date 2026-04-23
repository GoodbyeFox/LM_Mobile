import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useLMStudio } from '@/context/LMStudioContext';

interface Model {
  id: string;
  name: string;
  type?: string;
  parameters?: {
    temperature?: number;
    contextLength?: number;
  };
}

export default function ModelsScreen() {
  const { service, isConfigured, isLoading } = useLMStudio();
  const [models, setModels] = useState<Model[]>([]);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [isLoading2, setIsLoading2] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isConfigured && service) {
      loadModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, service]);

  const loadModels = async () => {
    if (!service || !isConfigured) return;

    setIsLoading2(true);
    try {
      const modelList = await service.listModels();
      setModels(modelList);

      const loaded = await service.getLoadedModel();
      if (loaded) {
        setLoadedModel(loaded.id);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load models');
    } finally {
      setIsLoading2(false);
    }
  };

  const handleLoadModel = async (modelId: string) => {
    if (!service || !isConfigured) return;

    Alert.alert('Load Model', `Load model "${modelId}"?`, [
      { text: 'Cancel' },
      {
        text: 'Load',
        onPress: async () => {
          try {
            setIsLoading2(true);
            await service.loadModel(modelId);
            setLoadedModel(modelId);
            Alert.alert('Success', 'Model loaded successfully');
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load model');
          } finally {
            setIsLoading2(false);
          }
        },
      },
    ]);
  };

  const handleUnloadModel = async () => {
    if (!service || !isConfigured) return;

    Alert.alert('Unload Model', 'Unload the current model?', [
      { text: 'Cancel' },
      {
        text: 'Unload',
        onPress: async () => {
          try {
            setIsLoading2(true);
            await service.unloadModel();
            setLoadedModel(null);
            Alert.alert('Success', 'Model unloaded successfully');
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to unload model');
          } finally {
            setIsLoading2(false);
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadModels();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>LM Studio Not Configured</Text>
        <Text style={styles.subtitle}>
          Please go to Settings to configure your LM Studio connection.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loadedModel && (
        <View style={styles.loadedModelSection}>
          <Text style={styles.loadedModelTitle}>Currently Loaded</Text>
          <View style={styles.loadedModelCard}>
            <Text style={styles.loadedModelName}>{loadedModel}</Text>
            <TouchableOpacity
              style={styles.unloadButton}
              onPress={handleUnloadModel}
              disabled={isLoading2}>
              <Text style={styles.unloadButtonText}>Unload</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.availableSection}>
        <Text style={styles.availableTitle}>Available Models</Text>
      </View>

      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.modelCard}>
            <View style={styles.modelInfo}>
              <Text style={styles.modelName}>{item.name || item.id}</Text>
              <Text style={styles.modelType}>{item.type || 'Unknown'}</Text>
              {item.parameters?.contextLength && (
                <Text style={styles.modelParams}>
                  Context: {(item.parameters.contextLength / 1000).toFixed(0)}K tokens
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.loadButton, loadedModel === item.id && styles.loadButtonActive]}
              onPress={() => handleLoadModel(item.id)}
              disabled={isLoading2 || loadedModel === item.id}>
              <Text style={styles.loadButtonText}>
                {loadedModel === item.id ? 'Loaded' : 'Load'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.emptyText}>Loading models...</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadedModelSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadedModelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  loadedModelCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadedModelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    flex: 1,
  },
  unloadButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  availableSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  availableTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modelCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modelType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modelParams: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  loadButtonActive: {
    backgroundColor: '#34c759',
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
