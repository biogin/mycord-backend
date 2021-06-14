import { Connection, createConnection, getConnection, getCustomRepository } from "typeorm";

import { UserRepository } from "./userRepo";
import { CommentRepository } from "./commentRepo";
import { LikeRepository } from "./likeRepo";
import { ProfileRepository } from "./profileRepo";
import { PostRepository } from "./postRepo";
import { FollowerRepository } from "./followerRepo";
import { MessageRepository } from "./messageRepo";
import { ConversationRepository } from "./conversationRepo";
import { ActivityRepository } from "./activityRepo";
import { ConversationActivityRepository } from "./conversationActivity";

async function getOrCreateConnection() {
  try {
    return getConnection();
  } catch (e) {
    return createConnection();
  }
}

const customRepositories = [
  UserRepository,
  CommentRepository,
  LikeRepository,
  ProfileRepository,
  PostRepository,
  FollowerRepository,
  MessageRepository,
  ConversationRepository,
  ActivityRepository,
  ConversationActivityRepository
];

function getRepositories() {
  const [
    userRepo,
    commentRepo,
    likeRepo,
    profileRepo,
    postRepo,
    followerRepo,
    messageRepo,
    conversationRepo,
    activityRepo,
    conversationActivityRepo
  ] = customRepositories.map(repo => getCustomRepository(repo) as unknown);

  return {
    userRepo: userRepo as UserRepository,
    commentRepo: commentRepo as CommentRepository,
    likeRepo: likeRepo as LikeRepository,
    profileRepo: profileRepo as ProfileRepository,
    postRepo: postRepo as PostRepository,
    followerRepo: followerRepo as FollowerRepository,
    messageRepo: messageRepo as MessageRepository,
    conversationRepo: conversationRepo as ConversationRepository,
    activityRepo: activityRepo as ActivityRepository,
    conversationActivityRepo: conversationActivityRepo as ConversationActivityRepository
  };
}

export class Database {
  private repositories: ReturnType<typeof getRepositories>;
  private connection: Connection;

  async init(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = await getOrCreateConnection();

    await this.connection.runMigrations();

    this.repositories = Object.freeze(getRepositories());
  }

  get repos(): ReturnType<typeof getRepositories> {
    if (!this.repositories) {
      throw new Error('Database uninitialized');
    }

    return this.repositories;
  }
}
