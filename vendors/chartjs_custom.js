document.addEventListener('DOMContentLoaded', function () {
    const API_URL = "http://127.0.0.1:8000/api/user-file-counts/";

    // Function to get JWT token dynamically
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
// Function to initialize and render the bar chart
async function initializeBarChart() {
    const barChartCanvas = document.getElementById("barChart");
    if (!barChartCanvas) {
        console.error("#barChart element not found.");
        return;
    }

    const fileCounts = await fetchFileCounts();
    console.log("Fetched file counts:", fileCounts); // Debugging API response

    if (!fileCounts) {
        console.error("Unable to fetch file counts. Bar chart cannot be rendered.");
        return;
    }

    const realCount = parseInt(fileCounts.real) || 0;
    const fakeCount = parseInt(fileCounts.fake) || 0;

    console.log("Chart Data: Real:", realCount, "Fake:", fakeCount); // Debugging chart data

    const barCtx = barChartCanvas.getContext("2d");

    // Clear existing chart if any
    if (window.barChartInstance) {
        window.barChartInstance.destroy();
    }

    // Gradient for Real and Fake
    const gradientReal = barCtx.createLinearGradient(0, 0, 0, 400);
    gradientReal.addColorStop(0, "#4caf50"); // Green for Real
    gradientReal.addColorStop(1, "#81c784");

    const gradientFake = barCtx.createLinearGradient(0, 0, 0, 400);
    gradientFake.addColorStop(0, "#f44336"); // Red for Fake
    gradientFake.addColorStop(1, "#ef9a9a");

    // Bar chart initialization
    window.barChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ["Real", "Fake"], // Define categories explicitly
            datasets: [{
                label: "File Counts", // Explicit dataset label
                data: [realCount, fakeCount], // Data values for Real and Fake
                backgroundColor: [gradientReal, gradientFake],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false // Hide legend if unnecessary
                },
                title: {
                    display: true,
                    text: "Bar Chart: Real vs Fake", // Title above the chart
                    font: {
                        size: 18
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Category",
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(realCount, fakeCount) + 5, // Adjust Y-axis range
                    title: {
                        display: true,
                        text: "Count",
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}


    // Function to initialize and render the pie chart
    async function initializePieChart() {
        const pieChartCanvas = document.getElementById("pieChart");
        if (!pieChartCanvas) {
            console.error("#pieChart element not found.");
            return;
        }

        const fileCounts = await fetchFileCounts();
        if (!fileCounts) {
            console.error("Unable to fetch file counts. Pie chart cannot be rendered.");
            return;
        }

        const pieCtx = pieChartCanvas.getContext("2d");

        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ["Real", "Fake"], // Updated to match data provided
                datasets: [{
                    data: [fileCounts.real, fileCounts.fake], // Data from the API
                    backgroundColor: [
                        "rgba(76, 175, 80, 0.9)", // Green for Real
                        "rgba(244, 67, 54, 0.9)"  // Red for Fake
                    ],
                    hoverBackgroundColor: [
                        "rgba(76, 175, 80, 1)",
                        "rgba(244, 67, 54, 1)"
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Initialize both charts and refresh every 30 seconds
    async function refreshCharts() {
        await initializeBarChart();
        await initializePieChart();
    }

    // Initial load
    refreshCharts();

    // Set interval to refresh charts every 30 seconds
    setInterval(() => {
        refreshCharts();
    }, 30000); // 30 seconds
});
