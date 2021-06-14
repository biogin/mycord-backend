import { Activity } from "../../domain/entities/Activity";

export interface ActivityRepository {
  decrementLikes(activityId: number, count: number): Promise<void>;

  incrementLikes(activityId: number, count: number): Promise<void>;

  save(entity: Activity): Promise<Activity>;
}
