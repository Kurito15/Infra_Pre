import { supabase } from "./supabase";

export type ResearchTopic = "repair_guidance" | "code_lookup" | "material_rates";

export interface ResearchRequest {
  topic: ResearchTopic;
  defectType: string;
  element?: string;
  location?: string;
}

export interface ResearchRunSnapshot {
  ok: boolean;
  runId: string;
  status: string;
  result: unknown | null;
  error?: { code?: string | null; message?: string } | null;
  note?: string;
}

export interface StartedResearchRun extends ResearchRunSnapshot {
  runAccessToken: string;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new Error("Please sign in first.");
  return token;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);
  if (!response.ok || !json) {
    throw new Error(
      typeof json?.error === "string"
        ? json.error
        : `Request failed (${response.status}).`
    );
  }
  return json as T;
}

export async function researchDefect(
  request: ResearchRequest
): Promise<StartedResearchRun> {
  const token = await getAccessToken();
  const response = await fetch("/api/tinyfish-research", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  return parseResponse<StartedResearchRun>(response);
}

export async function getResearchRun(
  runId: string,
  runAccessToken: string
): Promise<ResearchRunSnapshot> {
  const token = await getAccessToken();
  const response = await fetch(
    `/api/tinyfish-research?runId=${encodeURIComponent(runId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-TinyFish-Run-Token": runAccessToken,
      },
    }
  );
  return parseResponse<ResearchRunSnapshot>(response);
}
