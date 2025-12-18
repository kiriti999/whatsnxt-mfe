import { BetaAnalyticsDataClient } from "@google-analytics/data";
import path from "path";
import fs from "fs";

const propertyId = "467708462";

// Load the service account JSON credentials
const keyFile = path.resolve(__dirname, "../../utils/course/keyFile.json"); // Replace with the path to your key file
const credentials = JSON.parse(fs.readFileSync(keyFile, "utf8"));

const client = new BetaAnalyticsDataClient({ credentials });

async function getData(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dimensions: [
        { name: "fullPageUrl" }, // Dimension for URL path (e.g., '/about', '/contact')
      ],
      metrics: [
        { name: "screenPageViews" }, // Metric to get total page views
      ],
      dateRanges: [
        {
          startDate: "2015-08-14", // Format: YYYY-MM-DD
          endDate: "today",
        },
      ],
    });

    const data = response.rows.map((row) => ({
      pagePath: row.dimensionValues[0].value,
      pageViews: row.metricValues[0].value,
    }));
    const filteredData = data.filter((item) =>
      item.pagePath.includes("localhost/courses/"),
    );

    res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error fetching GA data:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
}

export { getData };
