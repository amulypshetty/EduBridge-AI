
const pool = require("../config/db");

const isExamplePlaceholderUrl = (rawUrl) => {
    const trimmed = String(rawUrl || "").trim();
    if (/^https?:\/\/([^/]+\.)?example\.com(\/|$|\?|#)/i.test(trimmed)) {
        return true;
    }
    return false;
};

const isValidResourceUrl = (rawUrl) => {
    const trimmed = String(rawUrl || "").trim();
    if (trimmed.startsWith("/pdfs/") && trimmed.toLowerCase().endsWith(".pdf")) {
        return true;
    }
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

// CREATE RESOURCE (Faculty only)
const createResource = async (req, res) => {
    try {
        const { title, description, subject, resource_url } = req.body;

        if (!title || !subject || !resource_url) {
            return res.status(400).json({
                success: false,
                message: "Title, subject and resource URL are required"
            });
        }

        const trimmedUrl = resource_url.trim();

        if (isExamplePlaceholderUrl(trimmedUrl)) {
            return res.status(400).json({
                success: false,
                message: "Placeholder example.com URLs are not allowed. Please provide a real lecture video, website, or PDF link."
            });
        }

        if (!isValidResourceUrl(trimmedUrl)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid http(s) URL or /pdfs/ path"
            });
        }

        const result = await pool.query(
            `INSERT INTO resources
            (faculty_id, title, description, subject, resource_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                req.user.user_id,
                title.trim(),
                description || null,
                subject.trim(),
                trimmedUrl
            ]
        );

        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            resource: result.rows[0]
        });

    } catch (error) {
        console.error("Create resource error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create resource"
        });
    }
};

// GET ALL RESOURCES (Authenticated users)
const getAllResources = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                r.resource_id,
                r.faculty_id,
                u.full_name AS faculty_name,
                r.title,
                r.description,
                r.subject,
                r.resource_url,
                r.created_at
            FROM resources r
            JOIN users u ON r.faculty_id = u.user_id
            ORDER BY r.created_at DESC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            resources: result.rows
        });

    } catch (error) {
        console.error("Get resources error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch resources"
        });
    }
};

module.exports = {
    createResource,
    getAllResources
};
