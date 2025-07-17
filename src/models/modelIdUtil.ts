import { assert } from "@/common/assertUtil";

function _isSizePart(part:string):boolean {
  if (part.toLowerCase() === 'mini') return true;
  const lastChar = part[part.length-1];
  if ('BbMm'.indexOf(lastChar) === -1 || part.length < 2) return false;
  for(let i = 0; i < part.length - 1; ++i) {
    const c = part[i];
    if ('0123456789.'.indexOf(c) === -1) return false;
  }
  return true;
}

function _isDistillPart(part:string):boolean {
  return part.toLowerCase() === 'distill';
}

function _hasMixedCase(part:string):boolean {
  const lower = part.toLowerCase(), upper = part.toUpperCase();
  return (part !== lower && part !== upper);
}

function _toInitialCap(part:string):string {
  /* v8 ignore next */
  assert(part.length > 0);
  return part[0].toUpperCase() + part.slice(1).toLowerCase();
}

function _normalizeFamilyName(part:string):string {
  if (_hasMixedCase(part)) return part; // Since the model ID is trying to accomplish something with case, I'll preserve it.
  return _toInitialCap(part);
}

function _normalizeSize(part:string):string {
  if (part.toLowerCase() === 'mini') return 'Mini';
  return part.toUpperCase();
}

export function nicknameModelId(modelId:string, otherNicknames:string[] = []):string {
  let familyName = '', size = '', distillName = '';
  const parts = modelId.split('-');
  familyName = _normalizeFamilyName(parts[0].trim());
  for(let partI = 1; partI < parts.length; ++partI) {
    const part = parts[partI].trim();
    if (_isSizePart(part)) size = _normalizeSize(part);
    if (_isDistillPart(part) && partI < parts.length-1) distillName = _normalizeFamilyName(parts[partI+1].trim());
  }
  let nickname = (distillName.length) 
    ? `${distillName} < ${familyName} ${size}`.trim()
    : `${familyName} ${size}`.trim();

  const nicknameNumber = otherNicknames.filter(n => n === nickname || n.startsWith(`${nickname} #`)).length;
  if (nicknameNumber > 0) nickname += ` #${nicknameNumber + 1}`;
  return nickname;
}