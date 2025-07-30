// Tests added here are temporary. The functionality being tested is likely to move to a different more complete test later.

import { AUTO_SELECT_ID } from "@/settings/settingsDialog/setters/interactions/models";
import SupportedModelSetter from "@/settings/settingsDialog/setters/SupportedModelSetter";
import SettingType from "@/settings/types/SettingType";

function _testSupportedModelSetter() {
  return <>
    <h3>SupportedModelSetter</h3>
    <SupportedModelSetter
      setting={{
        id: 'supported-models',
        type: SettingType.SUPPORTED_MODEL,
        label: 'Supported Models',
        value: 'Llama-3-70B-Instruct-q3f16_1-MLC',
        models: [
          { id:'Llama-3-70B-Instruct-q3f16_1-MLC', appBehaviorSummary:'Help us test this.', beta: true },
          { id:'Llama-3.1-8B-Instruct-q4f16_1-MLC', appBehaviorSummary:'Best option for most.' },
          { id:'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC', appBehaviorSummary:'Better for math.'}
        ]
      }}
      onChange={() => {}}
    />

    <h3>SupportedModelSetter - No Models</h3>
    <SupportedModelSetter
      setting={{
        id: 'supported-models',
        type: SettingType.SUPPORTED_MODEL,
        label: 'Supported Models',
        value: AUTO_SELECT_ID,
        models: []
      }}
      onChange={() => {}}
    />
  </>;
}

function AdhocTests() {
  return <>
    <h2>Adhoc Tests</h2>
    {_testSupportedModelSetter()}
  </>;
}

export default AdhocTests;