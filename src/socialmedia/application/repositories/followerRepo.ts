import { Repository } from 'typeorm';
import { Follower } from "../../domain/entities/Follower";

export interface FollowerRepository extends Repository<Follower> {}
