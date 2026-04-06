import { useEffect } from "react";
import Chart from "chart.js/auto";
import "./Dashboard.css";

function Dashboard() {

    useEffect(() => {

        // CLOCK
        const clock = document.getElementById("clock");
        setInterval(() => {
            const now = new Date();
            clock.innerText = now.toLocaleTimeString();
        }, 1000);

        // LINE CHART
        new Chart(document.getElementById("lineChart"), {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{
                    data: [30, 50, 20, 60, 80, 70],
                    borderColor: "#a892f0",
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // BAR
        const barChart = new Chart(barRef.current, {
            type: "bar",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu"],
                datasets: [{
                    label: "Duration",
                    data: [70, 50, 90, 40],
                    backgroundColor: "#e07aaa",
                    borderRadius: 8
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // DONUT
        new Chart(donutRef.current, {
            type: "doughnut",
            data: {
                labels: ["Growth", "Career", "Relationship", "Other"],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ["#a892f0", "#e07aaa", "#7ad0e0", "#f0c070"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        });

    }, []);

    return (
        <div className="dash-wrap">

            {/* TOPBAR */}
            <div className="topbar">
                <h2>S.P.E.A.K Dashboard 💜</h2>
                <div id="clock"></div>
            </div>

            {/* KPI */}
            <div className="kpi-grid">
                <div className="kpi-card">Total Speakers<br /><b>14,250</b></div>
                <div className="kpi-card">New Messages<br /><b>3,120</b></div>
                <div className="kpi-card">Engagement<br /><b>78%</b></div>
                <div className="kpi-card">Active Sessions<br /><b>1,890</b></div>
            </div>

            {/* CHARTS */}
            <div className="charts-row">
                <div style={{ position: "relative", height: "300px", width: "100%" }}>
                    <canvas ref={lineRef}></canvas>
                </div>
                <div style={{ position: "relative", height: "300px", width: "100%" }}>
                    <canvas ref={donutRef}></canvas>
                </div>
            </div>

            {/* BOTTOM */}
            <div className="bottom-row">
                <div style={{ position: "relative", height: "300px", width: "100%" }}>
                    <canvas ref={barRef}></canvas>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Aisha</td><td>Report</td><td>Active</td></tr>
                        <tr><td>Dev</td><td>Join</td><td>Pending</td></tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default Dashboard;