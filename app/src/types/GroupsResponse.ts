import { Group } from "./Group";

export interface GroupsResponse {
    [groupId: string]: Group;
  }