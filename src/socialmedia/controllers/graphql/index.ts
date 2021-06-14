import { gql } from "apollo-server-express";

export const typeDefs = gql`
    scalar Upload

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
        audioUrl: String
        createdAt: String
        profile: Profile
        likes: [Like]
        comments: [Comment]
    }

    type Comment {
        id: ID

        text: String!
        profile: Profile
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
        unreadMessagesCount: Int
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

    type MessageSent {
        authorProfile: Profile
        text: String
        currentConversationId: ID
    }

    type Subscription {
        messageSent(subscriptionId: ID): MessageSent
        userTyping(subscriptionId: ID): Boolean
    }

    type Query {
        user(username: String!): UserInfo!,
        post(id: ID): Post!,
        posts(userId: ID): [Post!]

        recentPosts: [Post!]

        conversations(conversationIds: [ID]): [Conversation!]
        conversation(id: ID!): Conversation
        conversationByUsersIds(userOne: ID!, userTwo: ID!): Conversation

        loggedInUser: Profile
        userExists(username: String!): Boolean
    }

    type Mutation {
        signup(username: String, password: String, email: String, birthday: String): Profile
        login(email: String, password: String): Profile
        signout: Profile

        sendEmailVerification(email: String!): String

        createPost(title: String!, audioUrl: String): Post

        likeEntity(entityId: ID!, likedEntityType: LikedEntityType!, userId: ID!): Like

        editProfile(imageUrl: String): Boolean

        leaveComment(postId: ID!, userId: ID!, commentText: String!): Comment!

        sendMessage(receiverId: ID!, text: String!, currentConversationId: ID, markAsRead: Boolean): Int
        
        setConversationStatus(id: ID!, status: ConversationStatus): Conversation

        follow(username: String): Int
    }
`;
