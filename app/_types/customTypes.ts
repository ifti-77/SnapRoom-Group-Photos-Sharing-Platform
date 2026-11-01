
export enum DeletePin{
    NoPin = "NoPin",
}

export interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export interface RoomData {
  id: string;
  name: string;
  delete_pin: string;
  folders: Folder[];
}