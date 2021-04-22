import { EntityManager } from "typeorm";

import { LikeEntityUseCase } from "./likeEntity";
import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { LikeRepository } from "../repositories/likeRepo";
import { LeaveCommentUseCase } from "./leaveComment";
import { FollowUserUseCase } from "./followUser";
import { FollowerRepository } from "../repositories/followerRepo";
import { ProfileRepository } from "../repositories/profileRepo";
import { SendMessageUseCase } from "./sendMessage";
import { MessageRepository } from "../repositories/messageRepository";
import { ConversationRepository } from "../repositories/conversationRepo";

export interface UseCase<Request = any, Result = any> {
  execute(request: Request): Result;
}

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  profileRepo: ProfileRepository;
  likeRepo: LikeRepository;
  followerRepo: FollowerRepository;
  messageRepo: MessageRepository;
  conversationRepo: ConversationRepository;

  // #todo ugly
  getTransactionManager(): EntityManager;
}

export function getApplicationUseCases({ userRepo, getTransactionManager, postRepo, commentRepo, profileRepo, likeRepo, followerRepo, conversationRepo, messageRepo }: Deps): { [name: string]: UseCase<unknown, unknown> } {
  const likeEntityUseCase = new LikeEntityUseCase({ userRepo, commentRepo, postRepo, getTransactionManager, likeRepo });
  const leaveCommentUseCase = new LeaveCommentUseCase({ userRepo, commentRepo, postRepo, getTransactionManager, likeRepo });
  const followUserUseCase = new FollowUserUseCase({ userRepo, profileRepo, followerRepo, getTransactionManager });
  const sendMessageUseCase = new SendMessageUseCase({ messageRepo, conversationRepo, getTransactionManager, profileRepo, userRepo });

  return {
    likeEntityUseCase,
    leaveCommentUseCase,
    followUserUseCase,
    sendMessageUseCase
  }
}
