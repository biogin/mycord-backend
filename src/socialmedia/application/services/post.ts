import { Post } from "../../domain/entities/Post";

import { PostRepository } from "../repositories/postRepo";
import { FollowerRepository } from "../repositories/followerRepo";

interface Deps {
  postRepo: PostRepository;
  followerRepo: FollowerRepository;
}

export class PostService {
  postRepo: PostRepository;
  followerRepo: FollowerRepository;

  constructor({ postRepo, followerRepo }: Deps) {
    this.postRepo = postRepo;
    this.followerRepo = followerRepo;
  }

  async getRecentPosts(forUserId: number): Promise<Array<Post>> {
    const postUserIds = await this.followerRepo.findFollowedUserIds(forUserId);

    return this.postRepo.findPostsByUserIds(postUserIds);
  }
}
