import { request } from "@/lib/api/request";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_COUNT = 120;

export async function uploadVideoImageFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", "video-generator");
  return request("/infra/file/upload", {
    method: "POST",
    body: formData,
  });
}

export async function submitVideoGeneration(payload) {
  return request("/ai/video-generator/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getVideoGenerationTask(id) {
  return request(`/ai/video-generator/get?id=${encodeURIComponent(id)}`);
}

export async function getMyVideoGenerationTasks({ pageNo = 1, pageSize = 50 } = {}) {
  return request(`/ai/video-generator/my-page?pageNo=${pageNo}&pageSize=${pageSize}`);
}

export async function waitForVideoGeneration(id, onUpdate) {
  let latest = null;
  for (let i = 0; i < MAX_POLL_COUNT; i += 1) {
    latest = await getVideoGenerationTask(id);
    onUpdate?.(latest);
    if ([30, 40, 50].includes(latest?.status)) {
      return latest;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return latest;
}
