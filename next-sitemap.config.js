module.exports = {
  siteUrl: "https://cetextra.fr",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/private/"] }
    ]
  },
  exclude: ["/sign-in", "blog/admin", "/blog/admin/*", "/company/*"]
};
