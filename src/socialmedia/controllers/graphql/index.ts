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
        audioUrl: String
        createdAt: String
        user: User
        likes: [Like]
        comments: [Comment]
    }
    
    type Comment {
        id: ID
        
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
        birthday: String!
        name: String
        imageUrl: String
        user: User
    }

    type Query {
        user(id: ID): User!,
        post(id: ID): Post!,
        posts(userId: ID): [Post!]
        loggedIn: Boolean
    }
    
    type Mutation {
        signup(name: String, password: String, email: String, birthday: String): Profile
        login(email: String, password: String): Profile
        signout: Profile
        
        createPost(description: String, title: String, audioUrl: String, userId: ID!): Post!
        
        likeEntity(entityId: ID!, likedEntityType: LikedEntityType!, userId: ID!): Like
        
        leaveComment(postId: ID!, userId: ID!, commentText: String!): Comment!
    }
`;
