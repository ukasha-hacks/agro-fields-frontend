'use client';
import { useState } from 'react';
import type { CropCatalog } from '@/lib/api';
import { Button } from './ui/button';
export function CropPicker({
  label,
  value,
  onChange,
  crops,
  allowUnknown = true,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  crops: CropCatalog['items'];
  allowUnknown?: boolean;
}) {
  const [other, setOther] = useState('');
  const [error, setError] = useState('');
  const choices = [
    ...crops.map((c) => ({ id: c.crop_id, label: c.crop_name })),
    ...value
      .filter((id) => id !== 'unknown' && !crops.some((c) => c.crop_id === id))
      .map((id) => ({ id, label: id })),
  ];
  function toggle(id: string) {
    const next = value.includes(id)
      ? value.filter((c) => c !== id)
      : [...value.filter((c) => c !== 'unknown'), id];
    onChange(next);
  }
  function addOther() {
    const cleaned = other.trim().toLowerCase();
    if (!cleaned || cleaned.length > 80) {
      setError('Use a crop name with 1–80 letters.');
      return;
    }
    if (cleaned === 'unknown') {
      onChange(['unknown']);
      setOther('');
      return;
    }
    onChange([...new Set([...value.filter((v) => v !== 'unknown'), cleaned])]);
    setOther('');
    setError('');
  }
  return (
    <fieldset className="crop-picker">
      <legend className="sr-only">{label}</legend>
      <div className="topic-options">
        {choices.map((crop) => (
          <label key={crop.id}>
            <input
              type="checkbox"
              checked={value.includes(crop.id)}
              onChange={() => toggle(crop.id)}
            />
            <span>{crop.label}</span>
          </label>
        ))}
        {allowUnknown && (
          <>
            <label>
              <input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} />
              <span>Fallow</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={value.includes('unknown')}
                onChange={() => onChange(['unknown'])}
              />
              <span>Not sure</span>
            </label>
          </>
        )}
      </div>
      <details className="other-crop">
        <summary>Another crop?</summary>
        <div className="mt-3 flex gap-2">
          <input
            className="other-crop-input"
            aria-label={`Other crop for ${label}`}
            value={other}
            maxLength={80}
            onChange={(e) => setOther(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addOther();
              }
            }}
            placeholder="Crop name"
          />
          <Button variant="secondary" size="small" type="button" onClick={addOther}>
            Add crop
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Other crops can be recorded, but may have no source reference.
        </p>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </details>
    </fieldset>
  );
}
