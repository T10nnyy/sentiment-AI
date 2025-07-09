import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql"

export const apolloClient = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
})

export const PREDICT_SENTIMENT = gql`
  query PredictSentiment($text: String!) {
    predict(text: $text) {
      label
      score
      processing_time
    }
  }
`

export const BATCH_PREDICT_SENTIMENT = gql`
  query BatchPredictSentiment($texts: [String!]!) {
    batchPredict(texts: $texts) {
      label
      score
      processing_time
    }
  }
`

export const GET_MODEL_INFO = gql`
  query GetModelInfo {
    modelInfo {
      model_name
      version
      framework
      labels
      max_length
      description
    }
  }
`
