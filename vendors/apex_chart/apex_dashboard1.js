// Base URL for your API
const API_URL = "http://127.0.0.1:8000/api/user_credits/"; // Replace with your actual API endpoint

// Variables to store the previous data for both charts
let previousRadialPercentage = null;
let previousLineChartData = null;

// Track if interval is already running
let refreshInterval = null;

// Flag to ensure only one event listener is running
let isEventListenerAttached = false;

// Track if an API request is already in progress (prevents overlapping API requests)
let isFetching = false;

// Function to get the JWT token dynamically (example: from localStorage or sessionStorage)
function getJwtToken() {
    return localStorage.getItem("jwt_token") || sessionStorage.getItem("jwt_token") || null;
}

// Function to fetch user credits from the API
async function fetchUserCredits() {
    if (isFetching) return; // Prevent multiple fetch calls at the same time

    const token = getJwtToken();
    if (!token) {
        console.error("JWT token is missing. Please log in.");
        return null;
    }

    try {
        isFetching = true; // Set the flag to true when API call starts

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from API. Check your token or server.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user credits:", error);
        return null;
    } finally {
        isFetching = false; // Reset the flag after the API call finishes
    }
}

// Function to update the credit displays in the HTML
function updateCreditDisplays(userCredits) {
    if (!userCredits) return;

    const totalCreditsElement = document.getElementById('total_credits');
    const usedCreditsElement = document.getElementById('used_credits');
    const remainingCreditsElement = document.getElementById('remaining_credits');

    if (totalCreditsElement) totalCreditsElement.textContent = userCredits.api_credits;
    if (usedCreditsElement) usedCreditsElement.textContent = userCredits.used_seconds;
    if (remainingCreditsElement) remainingCreditsElement.textContent = userCredits.remaining_credits;
}

// Function to initialize and refresh the radial bar chart dynamically
async function initializeAndRefreshRadialChart(userCredits) {
    const totalCredits = userCredits.api_credits || 1;
    const usedCredits = userCredits.used_seconds || 0;
    const usedPercentage = Math.round((usedCredits / totalCredits) * 100);

    if (usedPercentage === previousRadialPercentage) return;

    previousRadialPercentage = usedPercentage;

    const options = {
        series: [usedPercentage],
        chart: {
            height: 300,
            type: "radialBar",
            offsetY: 0,
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: { margin: 0, size: "70%" },
                dataLabels: {
                    showOn: "always",
                    name: {
                        show: true,
                        fontSize: "13px",
                        fontWeight: "700",
                        offsetY: -5,
                        color: ["#000000", "#E5ECFF"],
                    },
                    value: {
                        color: ["#000000", "#E5ECFF"],
                        fontSize: "30px",
                        fontWeight: "700",
                        offsetY: -40,
                        show: true,
                        formatter: function (val) {
                            return val + "%";
                        },
                    },
                },
                track: { background: ["#E5ECFF", "#E5ECFF"], strokeWidth: "100%" },
            },
        },
        colors: ["#9767FD", "#E5ECFF"],
        stroke: { lineCap: "round" },
        labels: ["Used Credits"],
    };

    const chartElement = document.querySelector("#chart-currently");
    if (chartElement) {
        chartElement.innerHTML = "";
        const chart = new ApexCharts(chartElement, options);
        chart.render();
    }
}

// Function to refresh the chart periodically
function startChartAutoRefresh(interval = 30000) {
    if (refreshInterval) clearInterval(refreshInterval); // Clear existing interval
    refreshInterval = setInterval(async () => {
        const userCredits = await fetchUserCredits();
        if (userCredits) {
            updateCreditDisplays(userCredits);
            initializeAndRefreshRadialChart(userCredits);
        }
    }, interval);
}

// Function to start the process
function initializeApp() {
    if (isEventListenerAttached) return; // Prevent attaching multiple event listeners
    isEventListenerAttached = true;

    // Run an immediate call to load data the first time
    fetchUserCredits().then((userCredits) => {
        if (userCredits) {
            updateCreditDisplays(userCredits);
            initializeAndRefreshRadialChart(userCredits);
        }
    });

    // Start periodic chart refresh
    startChartAutoRefresh(30000); // Run every 30 seconds
}

document.addEventListener("DOMContentLoaded", initializeApp);
