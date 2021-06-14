import { UserInputError } from "apollo-server-express";
import { EntityManager } from "typeorm";

import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { Like, LikedEntityType } from "../../domain/entities/Like";
import { COMMENT_NOT_FOUND, POST_NOT_FOUND, USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { ActivityRepository } from "../repositories/activityRepo";
import { UseCase } from "../interfaces/useCase";
import { LikeRepository } from "../repositories/likeRepo";

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  likeRepo: LikeRepository;
  activityRepo: ActivityRepository;

  getTransactionManager(): EntityManager;
}

interface LikeEntityRequestDTO {
  likedEntityType: LikedEntityType;
  userId: number;
  entityId: number;
}

export class LikeEntityUseCase implements UseCase<LikeEntityRequestDTO, Promise<Like>> {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  likeRepo: LikeRepository;
  activityRepo: ActivityRepository;

  // getTransactionManager: () => EntityManager

  constructor({ userRepo, postRepo, commentRepo, likeRepo, activityRepo }: Deps) {
    this.userRepo = userRepo;
    this.commentRepo = commentRepo;
    this.postRepo = postRepo;
    this.likeRepo = likeRepo;
    this.activityRepo = activityRepo;

    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ userId, entityId, likedEntityType }: LikeEntityRequestDTO): Promise<Like> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User who liked this post doesn't exist ¯\\_(ツ)_/¯` });
    }

    /*
     todo have a field in Like entity to keep track of it's current state (liked/unliked)
    */

    switch (likedEntityType?.toLowerCase()) {
      case LikedEntityType.Comment: {
        const likedComment = await this.commentRepo.findById(entityId);

        if (!likedComment) {
          throw new UserInputError(COMMENT_NOT_FOUND, { message: `Liked comment doesn't exist` });
        }

        const alreadyLiked = await this.likeRepo.findByUserAndCommentId(userId, entityId);

        if (alreadyLiked.active) {
          await this.likeRepo.update(alreadyLiked.id, { active: false });

          await this.activityRepo.decrementLikes(likedComment.activityId, 1);

          // maybe useful to know on the client what was deleted ?
          return alreadyLiked;
        }

        const like = Like.create({ user, likedEntityType: LikedEntityType.Comment, comment: likedComment });

        await this.likeRepo.save(like);

        await this.activityRepo.incrementLikes(likedComment.activityId, 1);

        return like;
      }
      case LikedEntityType.Post: {
        const likedPost = await this.postRepo.findOnyById(entityId);

        if (!likedPost) {
          throw new UserInputError(POST_NOT_FOUND, { message: `Liked post doesn't exist` });
        }

        const alreadyLiked = await this.likeRepo.findByUserAndPostId(entityId, userId);

        if (alreadyLiked.active) {
          await this.likeRepo.update(alreadyLiked.id, { active: false });

          await this.activityRepo.decrementLikes(likedPost.activityId, 1);

          return alreadyLiked;
        }

        const like = Like.create({ user, post: likedPost, likedEntityType: LikedEntityType.Post });

        await this.likeRepo.save(like);

        await this.activityRepo.incrementLikes(likedPost.activityId, 1);

        return like;
      }
      default: {
        throw new Error(`Invalid LikedEntityType: ${likedEntityType}`);
      }
    }
  }
}
