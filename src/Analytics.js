import ReactGA from "react-ga4";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TRACKING_ID = "G-XXXXXXX"; // substitui pelo teu ID GA4
ReactGA.initialize(TRACKING_ID);

function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname + location.search + location.hash;
    ReactGA.send({ hitType: "pageview", page: pagePath });
  }, [location]);

  return null;
}

export default Analytics;


// npm install react-ga4