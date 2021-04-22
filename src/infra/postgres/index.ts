import { Connection, createConnection, getConnection, Repository } from "typeorm";

import { Post } from "../../socialmedia/domain/entities/Post";
import { User } from "../../socialmedia/domain/entities/User";
import { Comment } from "../../socialmedia/domain/entities/Comment";
import { Like } from "../../socialmedia/domain/entities/Like";
import { Profile } from "../../socialmedia/domain/entities/Profile";
import { Follower } from "../../socialmedia/domain/entities/Follower";
import { Message } from "../../socialmedia/domain/entities/Message";
import { Conversation } from "../../socialmedia/domain/entities/Conversation";

async function getOrCreateConnection() {
  try {
    return getConnection();
  } catch (e) {
    return createConnection();
  }
}

type Entity = User | Post | Comment | Like | Profile;

const entities = [User, Comment, Like, Profile, Post, Follower, Message, Conversation];

function getRepositories(connection: Connection): { [key: string]: Repository<any> } {
  const [userRepo, commentRepo, likeRepo, profileRepo, postRepo, followerRepo, messageRepo, conversationRepo] = entities.map(entity => connection.getRepository(entity));

  return {
    userRepo,
    commentRepo,
    likeRepo,
    profileRepo,
    postRepo,
    followerRepo,
    messageRepo,
    conversationRepo
  };
}

export class Database {
  private repositories: { [key: string]: Repository<any> };
  private connection: Connection;

  async init(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = await getOrCreateConnection();

    await this.connection.runMigrations();

    this.repositories = Object.freeze(getRepositories(this.connection));
  }

  get repos(): { [key: string]: Repository<any> } {
    if (!this.repositories) {
      throw new Error('Database uninitialized');
    }

    return this.repositories;
  }
}
