import { describe, it, expect } from "vitest";

import { nicknameModelId } from '../modelIdUtil';

describe('shortenModelId', () => {
  it('should return family name and size for a basic model ID', () => {
    expect(nicknameModelId('Llama-3.2-1B-Instruct-q4f32_1-MLC')).toBe('Llama 1B');
  });

  it('should return distillation, family name, and size for a distillation model ID', () => {
    expect(nicknameModelId('DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC')).toBe('Qwen < DeepSeek 1.5B');
  });

  it('should handle unknown models gracefully', () => {
    expect(nicknameModelId('UnknownModel')).toBe('UnknownModel');
  });

  it('should normalize whitespace', () => {
    expect(nicknameModelId('  Llama-3.2-1B-Instruct  ')).toBe('Llama 1B');
  });

  it('should return only the family name if no size or distillation is present', () => {
    expect(nicknameModelId('SmolLM2-XXX-Instruct-q0f16-MLC')).toBe('SmolLM2');
  });

  it('should preserved mixed case of a family name with mixed case', () => {
    expect(nicknameModelId('dogHouse')).toBe('dogHouse');
  });

  it('should use initial caps for a family name that is all lower case', () => {
    expect(nicknameModelId('doghouse')).toBe('Doghouse');
  });

  it('should use initial caps for a family name that is all upper case', () => {
    expect(nicknameModelId('DOGHOUSE')).toBe('Doghouse');
  });

  it('should treat mini as a size', () => {
    expect(nicknameModelId('Llama-3.2-mini-Instruct-q4f32_1-MLC')).toBe('Llama Mini');
  });

  it('should handle models with no size or distillation', () => {
    expect(nicknameModelId('Llama-3.2-Instruct-q4f32_1-MLC')).toBe('Llama');
  });

  it('should treat megabytes (m) as a size', () => {
    expect(nicknameModelId('Llama-3.2-1m-Instruct-q4f32_1-MLC')).toBe('Llama 1M');
  });

  it('if none of the other nicknames are the same, it should return the nickname as is', () => {
    expect(nicknameModelId('Llama-3.2-Instruct-q4f32_1-MLC', ['Llama 3.2 Instruct'])).toBe('Llama');
  });

  it('if one nickname is the same, it should append #2', () => {
    expect(nicknameModelId('Llama-3.2-Instruct-q4f32_1-MLC', ['Llama'])).toBe('Llama #2');
  });

  it('if multiple nicknames are the same, it should append the next number', () => {
    expect(nicknameModelId('Llama-3.2-Instruct-q4f32_1-MLC', ['Llama', 'Llama #2'])).toBe('Llama #3');
  });

  it('should not treat a part ending in "m" as a size if it is not a valid size', () => {
    expect(nicknameModelId('Llama-3.2-Bam-Instruct-q4f32_1-MLC')).toBe('Llama');
  });
});