module.exports = {
  siteUrl: "https://cetextra.fr",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/private/"] }
    ]
  }
};
