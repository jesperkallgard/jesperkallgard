/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: `Jesper Källgård – UX Designer`,
    description: `Jesper Källgård a UX Designer based in Jönköping, Sweden.`,
    author: `@jkallgard`,
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Yanone+Kaffeesatz\:300,400,700`,
          'Open+Sans\:300,400,700'
        ],
        display: 'swap'
      }
    },
  ],
}
