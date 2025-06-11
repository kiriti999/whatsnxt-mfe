export const calculateTotalViews = async (fetchViews, pathName) => {
    const resViews = await fetchViews();
    let totalViews = 0;
    const len = resViews?.rows ? resViews.rows.length : 0;

    for (let i = 0; i < len; i++) {
        const row = resViews.rows[i];
        const dimension = row.dimensionValues[0].value;
        const metric = parseInt(row.metricValues[0].value, 10);
        if (dimension.endsWith(pathName)) {
            totalViews += metric;
        }
    }

    return totalViews;
};
