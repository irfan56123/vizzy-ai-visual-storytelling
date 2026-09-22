export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
};

export type SceneStatus =
  | "empty"
  | "generating"
  | "completed";

export type Scene = {
  id: string;
  title: string;
  description?: string;
  status: SceneStatus;
  imageUrl?: string;
  approved?: boolean;
};

export type CreativeStyle = {
  name: string;
  description: string;
  colorPalette: string[];
  mood: string;
  artStyle: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  style?: CreativeStyle;
  messages: Message[];
  scenes: Scene[];
};