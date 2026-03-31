import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from 'antd';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import { getApiBaseUrl } from '../lib/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

export interface LocationValue {
  name: string;
  lat: number;
  lng: number;
}

interface GeocodeSuggestion {
  display_name: string;
  lat: number;
  lng: number;
  type: string;
  country: string;
  state: string;
  city: string;
}

interface LocationAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onLocationSelect?: (location: LocationValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Search location...',
  disabled = false,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position relative to viewport using fixed positioning
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  // Update position on scroll/resize so the dropdown follows the input
  useEffect(() => {
    if (!showDropdown) return;
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showDropdown, updateDropdownPosition]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/geocode-search?q=${encodeURIComponent(query.trim())}`
      );
      const result = await response.json();

      if (result.status && Array.isArray(result.data)) {
        setSuggestions(result.data);
        setShowDropdown(result.data.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Geocode search error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    const displayName = suggestion.display_name;
    onChange?.(displayName);
    onLocationSelect?.({
      name: displayName,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 250);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
      updateDropdownPosition();
    }
  };

  return (
    <div ref={inputRef} style={{ position: 'relative', width: '100%' }}>
      <Input
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        suffix={loading ? <LoadingOutlined spin style={{ color: '#6366f1' }} /> : <EnvironmentOutlined style={{ color: '#9ca3af' }} />}
      />

      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#fff';
              }}
            >
              <EnvironmentOutlined style={{ color: '#6366f1', marginTop: '3px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {suggestion.display_name}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  {suggestion.lat.toFixed(4)}, {suggestion.lng.toFixed(4)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
