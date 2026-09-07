import type { ThinkingLevel } from "@earendil-works/pi-agent-core";
import { isScmoProductMode, scmoDefaultModel, scmoDefaultProvider } from "./scmo-product-mode";

export const scmoDefaultToolNames = ["read", "edit", "write"];
export const scmoDefaultThinkingLevel: ThinkingLevel = "low";

export function getScmoInitialModel(): { provider: string; modelId: string } | undefined {
  if (!isScmoProductMode) return undefined;
  return {
    provider: process.env.SCMO_DEFAULT_PROVIDER || scmoDefaultProvider,
    modelId: process.env.SCMO_DEFAULT_MODEL || scmoDefaultModel,
  };
}

export function getScmoDefaultToolNames(): string[] | undefined {
  return isScmoProductMode ? scmoDefaultToolNames : undefined;
}

export function getScmoDefaultThinkingLevel(): ThinkingLevel | undefined {
  return isScmoProductMode ? scmoDefaultThinkingLevel : undefined;
}
