import { gql } from '@apollo/client';

// export const CHECK_TOKEN_QUERY = gql`
//   query CheckLinkedInToken {
//     isLinkedInTokenAvailable: checkLinkedInToken
//   }
// `;

export const CHECK_TOKEN_QUERY = gql`
  query CheckLinkedInToken {
    checkLinkedInToken
  }
`;

export const GET_AUTH_URL_QUERY = gql`
  query GetLinkedInAuthUrl {
    getLinkedInAuthUrl {
      authUrl
    }
  }
`;

export const SHARE_POST_MUTATION = gql`
  mutation ShareLinkedInPost(
    $url: String!,
    $title: String!,
    $email: String!,
    $text: String!,
    $thumbnailUrn: String,
    $media: [String!]! # Ensure media is a non-nullable list
  ) {
    shareLinkedInPost(
      url: $url,
      title: $title,
      email: $email,
      text: $text,
      thumbnailUrn: $thumbnailUrn,
      media: $media
    )
  }
`;
