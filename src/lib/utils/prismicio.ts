// Prismic client configuration
// Note: @prismicio/client not installed - using placeholder for now

const config = { repositoryName: 'sarga-labs' }

export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || config.repositoryName
