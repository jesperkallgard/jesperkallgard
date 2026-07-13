/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  // Används vid publicering på GitHub Pages (gatsby build --prefix-paths)
  pathPrefix: `/jesperkallgard`,
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
