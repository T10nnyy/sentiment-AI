"use client"

/**
 * Apollo GraphQL Client Configuration
 */

import { ApolloClient, InMemoryCache, createHttpLink, from, gql } from "@apollo/client"
import { onError } from "@apollo/client/link/error"
import { setContext } from "@apollo/client/link/context"
import toast from "react-hot-toast"

// HTTP Link
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql",
  credentials: "same-origin",
})

// Auth Link (if needed in future)
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  }
})

// Error Link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
      toast.error(`GraphQL Error: ${message}`)
    })
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`)
    toast.error(`Network Error: ${networkError.message}`)
  }
})

// Check if we're in development mode
const isDevelopment = typeof window !== "undefined" && window.location.hostname === "localhost"

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          predict: {
            merge: false,
          },
          batchPredict: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  connectToDevTools: isDevelopment,
})

// Add gql to the client for easy access
apolloClient.gql = gql

// GraphQL Queries and Mutations
export const PREDICT_SENTIMENT = gql`
  query PredictSentiment($text: String!) {
    predict(text: $text) {
      label
      score
    }
  }
`

export const BATCH_PREDICT_SENTIMENT = gql`
  query BatchPredictSentiment($texts: [String!]!) {
    batchPredict(texts: $texts) {
      label
      score
    }
  }
`

export const GET_MODEL_INFO = gql`
  query GetModelInfo {
    modelInfo {
      name
      framework
      quantized
      device
    }
  }
`
