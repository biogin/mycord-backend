import { gql } from "apollo-server-express";

export const typeDefs = gql`
    enum LikedEntityType {
        Comment,
        Post
    }
    
    type User {
        id: ID
        
        profile: Profile!
        posts: [Post]
        comments: [Comment]
#        followedUsers: [User]
#        subscribers: [User]
    }

    type Post {
        id: ID
        
        title: String
        description: String
        audioUrl: String!
        
        user: User
        
        likes: [Like]
        comments: [Comment]
    }
    
    type Comment {
        id: ID!
        
        text: String!
        user: User!
        post: Post
        likes: [Like]
    }
    
    type Like {
        id: ID
        
        likedEntityType: LikedEntityType
        post: Post
        comment: Comment
        
        user: User
    }

    type Profile {
        id: ID
        
        email: String!
        password: String!
        name: String
        imageUrl: String
        user: User
    }

    type Query {
        user(id: ID): User!,
        post(id: ID): Post!,
        posts(userId: String): [Post!]
    }
    
    type Mutation {
        createUser(name: String, password: String): User!
        signup(name: String, password: String, email: String, imageUrl: String): User!
        login(email: String, password: String): Profile!
        
        createPost(description: String, title: String, audioUrl: String, userId: ID!): Post!
        
        likeEntity(entityId: ID!, likedEntityType: LikedEntityType!, userId: ID!): Like
        
        leaveComment(postId: ID!, userId: ID!, commentText: String!): Comment!
    }
`;
