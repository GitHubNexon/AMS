const helmet = require('helmet');

module.exports = (app) => {
  // Setup Helmet
  app.use(helmet());

  // Setup Content Security Policy (CSP)
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"], // Allow only content from your own domain
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], // Allow external scripts from trusted CDNs like jsDelivr
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
        ], // Allow styles from trusted CDNs and Google Fonts
        imgSrc: ["'self'", "data:", "https://trusted.images.com"], // Allow images from your domain and data URIs
        fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow fonts from Google Fonts
        connectSrc: ["'self'", "https://api.example.com"], // Allow AJAX/Fetch connections to your external API
        frameSrc: ["'none'"], // Prevent embedding your app in an iframe
        objectSrc: ["'none'"], // Block plugins like Flash
        upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
        reportUri: "/csp-violation-report-endpoint", // Optional: Endpoint to log CSP violations
      },
    })
  );

  app.use(helmet.frameguard({ action: "deny" })); // Frameguard: Prevents your app from being embedded in an iframe, protecting it from clickjacking attacks.
  app.use(helmet.dnsPrefetchControl({ allow: true })); // DNS Prefetching: Prevents browsers from performing DNS prefetching.
  app.use(helmet.noSniff()); // X-Content-Type-Options: Prevents browsers from trying to guess the content type of files (MIME sniffing).
  app.use(helmet.xssFilter()); // XSS Protection: Enables the browser’s built-in XSS protection.
  app.use(helmet.referrerPolicy({ policy: "no-referrer" })); // Referrer Policy: Controls how much information about the referring page is passed on when navigating to your site.
};

//allow: true: Allows DNS prefetching to potentially speed up page loads.
//allow: false: Disables DNS prefetching to potentially enhance privacy.