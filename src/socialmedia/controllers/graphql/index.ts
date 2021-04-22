import { gql } from "apollo-server-express";

export const typeDefs = gql`
    enum LikedEntityType {
        Comment,
        Post
    }
    
    enum FollowingState {
        FOLLOW,
        NOFOLLOW
    }
    
    type User {
        id: ID
        
        joinedAt: String
        profile: Profile
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
        
        profileImageUrl: String
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
        
        email: String
        password: String
        birthday: String
        username: String
        firstName: String
        lastName: String
        imageUrl: String
        user: User
    }
    
    enum ConversationStatus {
        NewMessage,
        Default,
        Deleted
    }
    
    type Conversation {
        id: ID
        
        messages: [Message]
        status: String
        receivingUser: User
    }
    
    type UserInfo {
        user: User!
        isFollowing: Boolean
        me: Boolean
    }
    
    type Message {
        authorProfile: Profile
        text: String
    }
    
    type Subscription {
        messageSent(subscriptionId: ID): Message
    }

    type Query {
        user(username: String!): UserInfo!,
        post(id: ID): Post!,
        posts(userId: ID): [Post!]
        
        recentPosts: [Post!]
        conversations(conversationIds: [ID]): [Conversation!]
        conversation(id: ID): Conversation
        loggedInUser: Profile
        userExists(username: String!): Boolean
    }
    
    type Mutation {
        signup(username: String, password: String, email: String, birthday: String): Profile
        login(email: String, password: String): Profile
        signout: Profile
        
        sendEmailVerification(email: String!): String
        
        createPost(description: String!, title: String!, audioUrl: String!, userId: ID!): Post
        
        likeEntity(entityId: ID!, likedEntityType: LikedEntityType!, userId: ID!): Like
        
        leaveComment(postId: ID!, userId: ID!, commentText: String!): Comment!
        
        sendMessage(receiverId: ID!, text: String!): Message
        
        follow(username: String): Int
    }
`;
