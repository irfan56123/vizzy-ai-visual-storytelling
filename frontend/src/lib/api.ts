const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api";


// ============================================================
// TYPES
// ============================================================

export type ApiProject = {
  id: number;
  name: string;
  description: string;
  visual_style: string;
  art_style: string;
  mood: string;
  color_palette: string[];
  created_at: string;
  updated_at: string;
};


export type ApiScene = {
  id: number;
  project: number;
  title: string;
  description: string;
  dialogue: string;
  order: number;
  status:
    | "empty"
    | "generating"
    | "completed";
  image_url: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
};


export type ApiChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};


// ============================================================
// PROJECTS
// ============================================================

export async function getProjects(): Promise<
  ApiProject[]
> {

  const response = await fetch(
    `${API_BASE_URL}/projects/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch projects"
    );
  }

  return response.json();
}


export async function getProject(
  projectId: number
): Promise<ApiProject> {

  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch project"
    );
  }

  return response.json();
}


export async function createProject(
  data: {
    name: string;
    description?: string;
    visual_style?: string;
    art_style?: string;
    mood?: string;
    color_palette?: string[];
  }
): Promise<ApiProject> {

  const response = await fetch(
    `${API_BASE_URL}/projects/`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {

    const errorData =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      errorData?.error ||
        "Failed to create project"
    );
  }

  return response.json();
}


// ============================================================
// SCENES
// ============================================================

export async function getScenes(
  projectId: number
): Promise<ApiScene[]> {

  const response = await fetch(
    `${API_BASE_URL}/scenes/?project=${projectId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch scenes"
    );
  }

  return response.json();
}


export async function getProjectWithScenes(
  projectId: number
) {

  const [
    project,
    scenes,
  ] = await Promise.all([
    getProject(projectId),
    getScenes(projectId),
  ]);

  return {
    project,
    scenes,
  };
}


// ============================================================
// UPDATE SCENE
// ============================================================

export async function updateSceneApi(
  sceneId: number,
  data: {
    image_url?: string;
    status?:
      | "empty"
      | "generating"
      | "completed";
    approved?: boolean;
    title?: string;
    description?: string;
    dialogue?: string;
  }
): Promise<ApiScene> {

  const response = await fetch(
    `${API_BASE_URL}/scenes/${sceneId}/`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      result?.error ||
        "Failed to update scene"
    );
  }

  return result;
}


// ============================================================
// CHAT
// ============================================================

export async function getChatHistory(
  projectId: number
): Promise<ApiChatMessage[]> {

  const response = await fetch(
    `${API_BASE_URL}/scenes/chat/?project_id=${projectId}`,
    {
      cache: "no-store",
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.error ||
        "Failed to load chat history"
    );
  }

  return data?.messages || [];
}


export async function sendChatMessage(
  projectId: number,
  message: string
) {

  const response = await fetch(
    `${API_BASE_URL}/scenes/chat/`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        project_id:
          projectId,

        message,
      }),
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.error ||
        data?.details ||
        "Failed to send message"
    );
  }

  return data;
}


// ============================================================
// IMAGE GENERATION
// ============================================================

export async function generateSceneImage(
  sceneId: number
) {

  const response = await fetch(
    `${API_BASE_URL}/generations/generate/`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scene_id:
          sceneId,
      }),
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.error ||
        data?.details ||
        "Failed to generate image"
    );
  }

  return data;
}


export async function generateSceneImageOptions(
  sceneId: number,
  count: number = 3
) {

  const response = await fetch(
    `${API_BASE_URL}/generations/generate-options/`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scene_id:
          sceneId,

        count,
      }),
    }
  );

  const rawText =
    await response.text();

  let data: any = null;

  try {

    data = rawText
      ? JSON.parse(rawText)
      : null;

  } catch {

    data = null;
  }

  console.log(
    "IMAGE OPTIONS RESPONSE:",
    {
      status:
        response.status,

      ok:
        response.ok,

      data,

      rawText,
    }
  );

  if (!response.ok) {

    throw new Error(
      data?.details ||
        data?.error ||
        rawText ||
        `Image generation failed with status ${response.status}`
    );
  }

  if (
    !data ||
    data.success !== true ||
    !Array.isArray(
      data.images
    )
  ) {

    throw new Error(
      "Backend returned an invalid image generation response."
    );
  }

  return data;
}


// ============================================================
// APPROVE SCENE
// ============================================================

export async function approveScene(
  sceneId: number
) {

  const response = await fetch(
    `${API_BASE_URL}/scenes/${sceneId}/approve/`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {

    throw new Error(
      data?.error ||
        data?.details ||
        "Failed to approve scene"
    );
  }

  return data;
}


// ============================================================
// DELETE SCENE
// ============================================================

export async function deleteScene(
  sceneId: number
) {

  const response = await fetch(
    `${API_BASE_URL}/scenes/${sceneId}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {

    const data =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      data?.error ||
        "Failed to delete scene"
    );
  }

  return true;
}


// ============================================================
// CLEAR PROJECT SCENES
// ============================================================

export async function clearProjectScenes(
  projectId: number,
  sceneIds: number[]
) {

  if (
    sceneIds.length === 0
  ) {

    return {
      success: true,
      deleted_count: 0,
    };
  }

  await Promise.all(
    sceneIds.map(
      (sceneId) =>
        deleteScene(
          sceneId
        )
    )
  );

  return {
    success: true,

    project_id:
      projectId,

    deleted_count:
      sceneIds.length,
  };
}


export async function deleteProject(
  projectId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to delete project: ${response.status}`
    );
  }
}