import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    cache: new InMemoryCache({
        typePolicies: {
            // Add type policies if needed
        }
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network', // Better for bfcache
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'cache-first', // This helps with bfcache
            errorPolicy: 'all',
        },
        mutate: {
            fetchPolicy: 'no-cache', // Only mutations should skip cache
            errorPolicy: 'all',
        }
    }
})