import { request } from "@/lib/api/request";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_COUNT = 80;

export async function uploadImageFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", "image-generator");
  return request("/infra/file/upload", {
    method: "POST",
    body: formData,
  });
}

export async function submitImageGeneration(payload) {
  return request("/ai/image-generator/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getImageGenerationTask(id) {
  return request(`/ai/image-generator/get?id=${encodeURIComponent(id)}`);
}

export async function getMyImageGenerationTasks({ pageNo = 1, pageSize = 50 } = {}) {
  return request(`/ai/image-generator/my-page?pageNo=${pageNo}&pageSize=${pageSize}`);
}

export async function waitForImageGeneration(id, onUpdate) {
  let latest = null;
  for (let i = 0; i < MAX_POLL_COUNT; i += 1) {
    latest = await getImageGenerationTask(id);
    onUpdate?.(latest);
    if (latest?.status === 30 || latest?.status === 40) {
      return latest;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return latest;
}
