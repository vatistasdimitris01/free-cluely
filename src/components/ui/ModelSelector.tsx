import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Home, RefreshCw, Cpu, Globe, CheckCircle2, AlertCircle, Loader2, Languages, Mic, ChevronDown, Check } from 'lucide-react';

interface ModelConfig {
  provider: "ollama" | "gemini";
  model: string;
  isOllama: boolean;
  language?: string;
}

interface ModelSelectorProps {
  onModelChange?: (provider: "ollama" | "gemini", model: string) => void;
  onSettingsClose?: () => void;
}

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelChange, onSettingsClose }) => {
  const [currentConfig, setCurrentConfig] = useState<ModelConfig | null>(null);
  const [availableOllamaModels, setAvailableOllamaModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<"ollama" | "gemini">("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [ollamaUrl, setOllamaUrl] = useState<string>("http://localhost:11434");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentConfig();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setIsLoading(true);
      const config = await window.electronAPI.invoke("get-current-llm-config");
      setCurrentConfig(config);
      setSelectedProvider(config.provider);
      setSelectedModel(config.model);
      
      if (config.provider === 'ollama') {
        await loadOllamaModels();
      }
    } catch (error) {
      console.error('Error loading current config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOllamaModels = async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('testing');
      const models = await window.electronAPI.invoke("get-available-ollama-models");
      setAvailableOllamaModels(models);
      
      if (selectedProvider === 'ollama' && models.length > 0 && (!selectedModel || !models.includes(selectedModel))) {
        setSelectedModel(models[0]);
      }
      
      setConnectionStatus('success');
    } catch (error) {
      console.error('Error loading Ollama models:', error);
      setAvailableOllamaModels([]);
      setConnectionStatus('error');
      setErrorMessage('Ollama not found or no models. Is it running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    try {
      setConnectionStatus('testing');
      let result;
      
      if (selectedProvider === 'ollama') {
        result = await window.electronAPI.invoke("switch-to-ollama", selectedModel, ollamaUrl);
      } else {
        result = await window.electronAPI.invoke("switch-to-gemini", selectedModel, geminiApiKey || undefined);
      }

      if (result.success) {
        await loadCurrentConfig();
        setConnectionStatus('success');
        onModelChange?.(selectedProvider, selectedModel);
        setTimeout(() => onSettingsClose?.(), 800);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Switch failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(String(error));
    }
  };

  if (isLoading && !currentConfig) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">Syncing</span>
      </div>
    );
  }

  const currentModels = selectedProvider === 'gemini' 
    ? GEMINI_MODELS.map(m => ({ id: m.id, name: m.name }))
    : availableOllamaModels.map(m => ({ id: m, name: m }));

  const selectedModelName = selectedProvider === 'gemini'
    ? GEMINI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel
    : selectedModel;

  return (
    <div className="space-y-6 max-w-[280px] mx-auto">
      {/* Section: AI Provider */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Cpu className="w-3 h-3 text-white/20" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Intelligence Provider</span>
        </div>
        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => {
              setSelectedProvider('gemini');
              setSelectedModel('gemini-2.0-flash');
            }}
            className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedProvider === 'gemini'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/20 hover:text-white/40'
            }`}
          >
            Gemini
          </button>
          <button
            onClick={() => {
              setSelectedProvider('ollama');
              if (availableOllamaModels.length > 0) {
                setSelectedModel(availableOllamaModels[0]);
              } else {
                loadOllamaModels();
              }
            }}
            className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
              selectedProvider === 'ollama'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/20 hover:text-white/40'
            }`}
          >
            Ollama
          </button>
        </div>
      </div>

      {/* Section: Configuration */}
      <div className="space-y-4">
        {selectedProvider === 'gemini' && (
          <div className="group">
            <input
              type="password"
              placeholder="API KEY"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full px-3 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-white placeholder-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all tracking-widest font-mono mb-3"
            />
          </div>
        )}
        
        {selectedProvider === 'ollama' && (
          <input
            type="url"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            placeholder="ENDPOINT URL"
            className="w-full px-3 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all font-mono mb-3"
          />
        )}

        {/* Custom Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-3 h-3 text-white/20" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Model Selection</span>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-white hover:bg-white/[0.04] hover:border-white/10 transition-all"
            >
              <span className="truncate font-bold uppercase tracking-wider">
                {selectedModelName || "Select Model"}
              </span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="max-h-[180px] overflow-y-auto py-1 scrollbar-hide">
                  {currentModels.length > 0 ? (
                    currentModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors group"
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                          selectedModel === model.id ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                        }`}>
                          {model.name}
                        </span>
                        {selectedModel === model.id && (
                          <Check className="w-3 h-3 text-white/60" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 italic">
                        No models available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 space-y-3">
        <button
          onClick={handleApplyChanges}
          disabled={connectionStatus === 'testing'}
          className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl"
        >
          {connectionStatus === 'testing' ? 'Verifying...' : 'Apply Changes'}
        </button>

        {connectionStatus && connectionStatus !== 'testing' && (
          <div className={`flex items-center justify-center gap-2`}>
            {connectionStatus === 'success' ? (
              <CheckCircle2 className="w-3 h-3 text-green-500/50" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-500/50" />
            )}
            <span className={`text-[9px] font-bold uppercase tracking-widest ${
              connectionStatus === 'success' ? 'text-green-500/50' : 'text-red-500/50'
            }`}>
              {connectionStatus === 'success' ? 'Settings Saved' : errorMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;