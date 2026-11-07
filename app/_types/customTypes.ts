
export enum DeletePin {
  NoPin = "NoPin",
}

export interface Photo {
  id: string
  url: string
}

export interface Folder {
  id: string
  name: string
  created_at: string
  parent_folder_id: string
}

export interface RoomData {
  id: string
  name: string
  delete_pin: string
  folders: Folder[]
}

export interface FolderStructure {
  currentFolder: Folder | null
  parentFolder: Folder | null
}

export interface Message {
  id: string
  senderEmoji: string
  senderIdentity: string
  text: string
  createdAt: string
}