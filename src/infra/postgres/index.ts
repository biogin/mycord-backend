import { Connection, createConnection, getConnection, Repository } from "typeorm";

import { Post } from "../../socialmedia/domain/entities/Post";
import { User } from "../../socialmedia/domain/entities/User";
import { Comment } from "../../socialmedia/domain/entities/Comment";
import { Like } from "../../socialmedia/domain/entities/Like";
import { Profile } from "../../socialmedia/domain/entities/Profile";

export async function getOrCreateConnection() {
  try {
    return getConnection();
  } catch (e) {
    return createConnection();
  }
}

type Entity = User | Post | Comment | Like | Profile;

const entities = [User, Comment, Like, Profile, Post];

export function getRepositories(connection: Connection): { [key: string]: Repository<any> } {
  const [userRepo, commentRepo, likeRepo, profileRepo, postRepo] = entities.map(entity => connection.getRepository(entity));

  return {
    userRepo,
    commentRepo,
    likeRepo,
    profileRepo,
    postRepo
  };
}
