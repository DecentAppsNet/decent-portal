// Use Node.js APIs. Just load the file and return it as text.
import { readFile } from 'fs/promises';
import { URL } from 'url';
import https from 'https';

const MODEL_LIST_SOURCE_URL =  'https://raw.githubusercontent.com/DecentAppsNet/web-llm/refs/heads/main/src/config.ts';

/* Expected format of the model list source file:
export const prebuiltAppConfig: AppConfig = {
  useIndexedDBCache: false,
  model_list: [
    // Llama-3.2
    {
      model: "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC",
      model_id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
      model_lib:
        modelLibURLPrefix +
        modelVersion +
        "/Llama-3.2-1B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
      vram_required_MB: 1128.82,
      low_resource_required: true,
      overrides: {
        context_window_size: 4096,
      },
    },
    ...many more entries...
  ],
};

*/

type ModelInfo = {
  modelId:string,
  vramRequiredMb:number
}

type ModelList = Record<string, ModelInfo>;

function _findModelOpenBrace(text:string, fromPos:number):number {
  const nextOpenBraceI = text.indexOf('{', fromPos);
  if (nextOpenBraceI === -1) return -1;
  const nextCloseBraceI = text.indexOf('}', fromPos);
  if (nextCloseBraceI === -1 || nextOpenBraceI < nextCloseBraceI) return nextOpenBraceI;
  return -1; // Close brace before an open brace.
}

function _findModelCloseBrace(text:string, fromPos:number):number {
  let depth = 1, i = fromPos;
  while(i < text.length && depth >= 1) {
    let nextCloseBraceI = text.indexOf('}', i);
    if (nextCloseBraceI === -1) return -1;

    const nextOpenBraceI = text.indexOf('{', i);
    if (nextOpenBraceI === -1) {
      while(depth > 1) {
        --depth;
        nextCloseBraceI = text.indexOf('}', nextCloseBraceI + 1);
        if (nextCloseBraceI === -1) return -1;
      }
      return nextCloseBraceI;
    }
      
    if (nextOpenBraceI < nextCloseBraceI) {
      ++depth;
      i = nextOpenBraceI + 1;
    } else { // close brace before next open brace
      if (depth === 1) return nextCloseBraceI;
      --depth;
      i = nextCloseBraceI + 1;
    }
  }
  return -1;
}

function _parseModelMemberValue(text:string, modelOpenBrace:number, modelCloseBrace:number, memberName:string):string|null {
  // Examples:
  //  model_id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  //  vram_required_MB: 1128.82,
  let i = text.indexOf(`${memberName}:`, modelOpenBrace + 1);
  if (i === -1 || i >= modelCloseBrace) return null;
  i += (memberName.length - 1);
  let value = '', foundValueStart = false;
  while(i < text.length - 1) {
    const c = text[++i];
    if (!foundValueStart) { 
      if (c !== ':' && c !== '\t' && c !== ' ') {
        if (c === '"') ++i;
        foundValueStart = true;
        value = text[i];
      }
      continue;
    }
    if (c === '\n' || c === '\r' || c === '"' || c === ',') return value;
    value += c;
  }
  return value;
}

function _outputModelListJson(modelList:ModelList) {
  const json = JSON.stringify(modelList);
  console.log(json);
}

const APP_CONFIG_START = 'AppConfig = {';
function _parseModelList(text:string):ModelList {
  const modelList:ModelList = {};

  let seekPos = text.indexOf(APP_CONFIG_START);
  if (seekPos === -1) throw Error('Unexpected format - could not find start of model list.');
  seekPos += (APP_CONFIG_START.length + 1); // Seek one past the "{".
  while(seekPos < text.length) {
    const modelOpenBrace = _findModelOpenBrace(text, seekPos);
    if (modelOpenBrace === -1) break;
    const modelCloseBrace = _findModelCloseBrace(text, modelOpenBrace+1);
    if (modelCloseBrace === -1) throw Error('Unexpected format @${seekPos}  - truncated model info.');
    const modelId = _parseModelMemberValue(text, modelOpenBrace, modelCloseBrace, 'model_id');
    if (!modelId) throw Error(`Unexpected format @${seekPos} - could not find model_id.`)
    const vramRequiredMbText = _parseModelMemberValue(text, modelOpenBrace, modelCloseBrace, 'vram_required_MB');
    if (!vramRequiredMbText) throw Error(`Unexpected format @${seekPos} - could not find vram_required_MB.`);
    const vramRequiredMb:number = parseFloat(vramRequiredMbText);
    if (isNaN(vramRequiredMb)) throw Error(`Unexpected format @${seekPos} - vram_required_MB is not a number: ${vramRequiredMbText}`);
    modelList[modelId] = { modelId, vramRequiredMb };
    seekPos = modelCloseBrace + 1;
  }
  return modelList;
}

async function _fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const modelListText = await _fetchText(MODEL_LIST_SOURCE_URL);
  const modelList = _parseModelList(modelListText);
  _outputModelListJson(modelList);
}

main();