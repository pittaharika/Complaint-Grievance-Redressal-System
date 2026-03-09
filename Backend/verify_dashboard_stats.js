const API_URL = "http://127.0.0.1:5000/api";

const verifyDashboardStats = async () => {
    try {
        console.log("1. Logging in as Admin...");
        const loginRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test_hod@sasi.ac.in", // Try HOD first as they are admin-like or need a real admin. Let's try to create one if needed.
                // Actually, let's use the 'admin' from before.
                // Wait, I need a valid admin.
                // Let's create one on the fly? No, login route needs existing.
                // I will try to use the HOD created in reproduce_crash, but HOD might not have access to dashboard-stats?
                // The route says authorize("ADMIN"). HOD is role "HOD".
                // So I need role "ADMIN".
                // I will create a temp admin script or just assume one exists? 
                // Let's try a known admin if possible, or create one.
                email: "admin@sasi.ac.in",
                password: "adminpassword"
            })
        });

        if (!loginRes.ok) {
            console.log("Login failed, attempting to register temp admin...");
            // Register execution
            const regRes = await fetch(`${API_URL}/admin/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: "Temp Admin",
                    email: "temp_admin@sasi.ac.in",
                    password: "adminpassword",
                    role: "ADMIN",
                    secretKey: "admin123" // Assuming secret key check
                })
            });

            if (!regRes.ok) {
                const txt = await regRes.text();
                throw new Error(`Registration failed: ${txt}`);
            }

            // Login again
            const loginRes2 = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: "temp_admin@sasi.ac.in",
                    password: "adminpassword"
                })
            });

            if (!loginRes2.ok) throw new Error("Login failed after registration");
            const data = await loginRes2.json();
            var token = data.token;
        } else {
            const data = await loginRes.json();
            var token = data.token;
        }

        console.log("Logged in. Token received.");

        console.log("2. Fetching Dashboard Stats...");
        const statsRes = await fetch(`${API_URL}/admin/dashboard-stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.statusText}`);

        const statsData = await statsRes.json();
        console.log("--- Dashboard Stats Response ---");
        console.log(JSON.stringify(statsData, null, 2));

        const stats = statsData.stats;
        if (typeof stats.total === 'number' && Array.isArray(statsData.recentComplaints)) {
            console.log("✅ Verification SUCCESS: Structure is correct.");
        } else {
            console.error("❌ Verification FAILED: Invalid structure.");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
};

verifyDashboardStats();
