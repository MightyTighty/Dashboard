// Base URL for your API
const API_URL = "http://127.0.0.1:8000/api/user-file-counts/";

// Variable to store the previous data
let previousBarChartData = null;

// Function to get the JWT token dynamically
function getJwtToken() {
    return localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token") || null;
}

// Function to fetch file counts from the API
async function fetchFileCounts() {
    const token = getJwtToken();

    if (!token) {
        console.error("JWT token is missing. Please log in.");
        return null;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from API. Check your token or server.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching file counts:", error);
        return null;
    }
}

// Function to initialize and refresh the bar chart dynamically
async function initializeAndRefreshBarChart() {
    const fileCounts = await fetchFileCounts();

    if (!fileCounts) {
        console.error("Unable to fetch file counts. Chart cannot be updated.");
        return;
    }

    // Prepare data for the chart
    const barChartData = {
        series: [{
            name: "File Counts",
            data: [fileCounts.real, fileCounts.fake]
        }],
        categories: ["Real", "Fake"]
    };

    // Check if the data has changed
    if (JSON.stringify(barChartData) === JSON.stringify(previousBarChartData)) {
        console.log("Bar chart data has not changed. Skipping re-render.");
        return;
    }

    // Update the previous data
    previousBarChartData = barChartData;

    // Options for the bar chart
    const options = {
        chart: { type: "bar", height: 300 },
        series: barChartData.series,
        xaxis: {
            categories: barChartData.categories
        },
        colors: ["#4CAF50", "#FF5733"], // Real (Green), Fake (Red)
        dataLabels: {
            enabled: true
        },
        title: {
            text: "Real vs Fake Files",
            align: "center"
        }
    };

    // Render or update the chart
    const chartElement = document.querySelector("#bar-chart");
    if (chartElement) {
        chartElement.innerHTML = ""; // Clear existing chart if it exists
        const chart = new ApexCharts(chartElement, options);
        chart.render();
    } else {
        console.error("#bar-chart element not found in the DOM.");
    }
}

// Function to initialize and refresh the pie chart dynamically
async function initializeAndRefreshPieChart() {
    const fileCounts = await fetchFileCounts();

    if (!fileCounts) {
        console.error("Unable to fetch file counts. Chart cannot be updated.");
        return;
    }

    // Prepare data for the chart
    const pieChartData = [fileCounts.real, fileCounts.fake];

    // Options for the pie chart
    const options = {
        chart: { type: "pie", height: 300 },
        series: pieChartData,
        labels: ["Real", "Fake"],
        colors: ["#4CAF50", "#FF5733"], // Real (Green), Fake (Red)
        dataLabels: {
            enabled: true
        },
        title: {
            text: "Proportion of Real vs Fake Files",
            align: "center"
        }
    };

    // Render or update the chart
    const chartElement = document.querySelector("#pie-chart");
    if (chartElement) {
        chartElement.innerHTML = ""; // Clear existing chart if it exists
        const chart = new ApexCharts(chartElement, options);
        chart.render();
    } else {
        console.error("#pie-chart element not found in the DOM.");
    }
}

// Function to refresh the charts periodically (e.g., every 30 seconds)
function startChartAutoRefresh(interval = 30000) {
    // Fetch and refresh both charts initially
    initializeAndRefreshBarChart();
    initializeAndRefreshPieChart();

    // Set up an interval to refresh periodically
    setInterval(() => {
        initializeAndRefreshBarChart();
        initializeAndRefreshPieChart();
    }, interval);
}

// Start the auto-refresh process
startChartAutoRefresh();
