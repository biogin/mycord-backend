import { UserInputError } from "apollo-server-express";
import { EntityManager } from "typeorm";

import { UseCase } from "./index";
import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { Like, LikedEntityType } from "../../domain/entities/Like";
import { COMMENT_NOT_FOUND, POST_NOT_FOUND, USER_NOT_FOUND } from "../../controllers/graphql/constants/errors";
import { LikeRepository } from "../repositories/likeRepo";

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  likeRepo: LikeRepository;

  getTransactionManager(): EntityManager;
}

interface LikeEntityRequestDTO {
  likedEntityType: LikedEntityType;
  userId: string;
  entityId: string;
}

// like is created if user has already liked post/comment
// unliked(deleted) otherwise
export class LikeEntityUseCase implements UseCase<LikeEntityRequestDTO, Promise<Like>> {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  likeRepo: LikeRepository;

  // getTransactionManager: () => EntityManager

  constructor({ userRepo, postRepo, commentRepo, likeRepo }: Deps) {
    this.userRepo = userRepo;
    this.commentRepo = commentRepo;
    this.postRepo = postRepo;
    this.likeRepo = likeRepo;

    // this.getTransactionManager = getTransactionManager;
  }

  async execute({ userId, entityId, likedEntityType }: LikeEntityRequestDTO): Promise<Like | undefined> {
    const user = await this.userRepo.findOne(userId);

    if (!user) {
      throw new UserInputError(USER_NOT_FOUND, { message: `User who liked this post doesn't exist ¯\\_(ツ)_/¯` });
    }

    /*
     todo maybe it's better to have a field in Like entity to keep track of it's current state (liked/unliked)
    */

    switch (likedEntityType?.toLowerCase()) {
      case LikedEntityType.Comment: {
        const likedComment = await this.commentRepo.findOne(entityId);

        if (!likedComment) {
          throw new UserInputError(COMMENT_NOT_FOUND, { message: `Liked comment doesn't exist` });
        }

        const alreadyLiked = await this.likeRepo.findOne({
          relations: ['comment', 'user'],
          where: { user: { id: userId }, comment: { id: entityId } }
        });

        if (alreadyLiked) {
          await this.likeRepo.remove(alreadyLiked);

          // maybe useful to know on the client what was deleted ?
          return alreadyLiked;
        }

        const like = Like.create({ user, likedEntityType: LikedEntityType.Comment, comment: likedComment });

        await this.likeRepo.save(like);

        return like;
      }
      case LikedEntityType.Post: {
        const likedPost = await this.postRepo.findOne(entityId);

        if (!likedPost) {
          throw new UserInputError(POST_NOT_FOUND, { message: `Liked post doesn't exist` });
        }

        const alreadyLiked = await this.likeRepo.findOne({
          relations: ['post', 'user'],
          where: { user: { id: userId }, post: { id: entityId } }
        });

        if (alreadyLiked) {
          await this.likeRepo.remove(alreadyLiked);

          return alreadyLiked;
        }

        const like = Like.create({ user, post: likedPost, likedEntityType: LikedEntityType.Post });

        await this.likeRepo.save(like);

        return like;
      }
      default: {
        throw new Error(`Invalid LikedEntityType: ${likedEntityType}`);
      }
    }
  }
}
