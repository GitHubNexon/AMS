export let API_BASE_URL = null;

switch (process.env.NODE_ENV) {
  // to run or buld sandbox environment change port to 3001 and add /api-sandbox
  // API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`;
  // API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3001/api-sandbox`;
  // your local development api endpoint
  case "development":
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3002/ams/api`;
    break;
  case "production":
    // use this if backend is reversed proxy and front end is hosted elsewhere (adjust in cors)
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/ams/api`;
    // use this if front end is hosted by express server itself on :3000/NDC_AMS/
    // API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api`; //
    break;
}
