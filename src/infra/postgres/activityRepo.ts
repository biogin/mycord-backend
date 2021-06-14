import { EntityManager, EntityRepository } from "typeorm";

import { ActivityRepository as IActivityRepository } from "../../socialmedia/application/repositories/activityRepo";
import { Activity } from "../../socialmedia/domain/entities/Activity";

@EntityRepository(Activity)
export class ActivityRepository implements IActivityRepository {
  constructor(private manager: EntityManager) {
  }

  async save(entity: Activity): Promise<Activity> {
    return this.manager.save(entity);
  }

  async decrementLikes(activityId: number, count: number = 1): Promise<void> {
    await this.manager.decrement(Activity, { id: activityId }, 'likes', count)
  }

  async incrementLikes(activityId: number, count: number): Promise<void> {
    await this.manager.increment(Activity, { id: activityId }, 'likes', count)
  }
}
