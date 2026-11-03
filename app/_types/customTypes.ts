
export enum DeletePin{
    NoPin = "NoPin",
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

export interface FolderStructure{
  currentFolder: Folder | null
  parentFolder: Folder | null
}