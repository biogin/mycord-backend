import { EntityManager } from "typeorm";

import { LikeEntityUseCase } from "./likeEntity";
import { UserRepository } from "../repositories/userRepo";
import { PostRepository } from "../repositories/postRepo";
import { CommentRepository } from "../repositories/commentRepo";
import { LeaveCommentUseCase } from "./leaveComment";
import { FollowUserUseCase } from "./followUser";
import { FollowerRepository } from "../repositories/followerRepo";
import { ProfileRepository } from "../repositories/profileRepo";
import { SendMessageUseCase } from "./sendMessage";
import { ConversationRepository } from "../repositories/conversationRepo";
import { ActivityRepository } from "../repositories/activityRepo";
import { ConversationActivityRepository } from "../repositories/conversationActivityRepo";
import { CreatePostUseCase } from "./createPost";
import { LikeRepository } from "../repositories/likeRepo";
import { MessageRepository } from "../repositories/messageRepo";

interface Deps {
  userRepo: UserRepository;
  postRepo: PostRepository;
  commentRepo: CommentRepository;
  profileRepo: ProfileRepository;
  likeRepo: LikeRepository;
  followerRepo: FollowerRepository;
  messageRepo: MessageRepository;
  conversationRepo: ConversationRepository;
  activityRepo: ActivityRepository;
  conversationActivityRepo: ConversationActivityRepository;

  // #todo ugly
  getTransactionManager(): EntityManager;
}


export function getApplicationUseCases(
    {
      userRepo,
      getTransactionManager,
      postRepo,
      commentRepo,
      profileRepo,
      likeRepo,
      followerRepo,
      conversationRepo,
      messageRepo,
      activityRepo,
      conversationActivityRepo
    }: Deps
    // todo fix types
) {
  const likeEntityUseCase = new LikeEntityUseCase({
    userRepo,
    commentRepo,
    postRepo,
    getTransactionManager,
    likeRepo,
    activityRepo
  });
  const leaveCommentUseCase = new LeaveCommentUseCase({
    userRepo,
    commentRepo,
    postRepo,
    getTransactionManager,
    activityRepo
  });
  const followUserUseCase = new FollowUserUseCase({ userRepo, profileRepo, followerRepo, getTransactionManager });
  const sendMessageUseCase = new SendMessageUseCase({
    messageRepo,
    conversationRepo,
    getTransactionManager,
    profileRepo,
    userRepo,
    conversationActivityRepo
  });
  const createPostUseCase = new CreatePostUseCase({
    getTransactionManager,
    userRepo,
    postRepo,
    activityRepo
  });

  return {
    likeEntityUseCase: likeEntityUseCase as LikeEntityUseCase,
    leaveCommentUseCase: leaveCommentUseCase as LeaveCommentUseCase,
    followUserUseCase: followUserUseCase as FollowUserUseCase,
    sendMessageUseCase: sendMessageUseCase as SendMessageUseCase,
    createPostUseCase: createPostUseCase as CreatePostUseCase
  }
}

export type ApplicationUseCases = ReturnType<typeof getApplicationUseCases>;
