const pool = require("../config/db");

const SEED_RESOURCES = [
    {
        title: "Complete DBMS Notes (Modules 1 & 2: ER Model, Relational Algebra & SQL)",
        subject: "DBMS",
        description:
            "Comprehensive faculty lecture notes covering Entity-Relationship modeling, Relational Algebra operators, and foundational SQL queries.",
        resource_url: "/pdfs/DBMS-Notes.pdf"
    },
    {
        title: "DBMS Normalization Solved Problems (1NF, 2NF, 3NF & BCNF)",
        subject: "DBMS",
        description:
            "Step-by-step solved numerical examples and decomposition exercises for First, Second, Third, and Boyce-Codd Normal Forms.",
        resource_url: "/pdfs/DBMS-NORMALIZATION-PROBLEMS.pdf"
    },
    {
        title: "Advanced SQL, Triggers, Views & Transaction Processing (Modules 3 & 4)",
        subject: "DBMS",
        description:
            "Detailed study guide covering SQL triggers, views, stored procedures, ACID properties, concurrency control, and recovery.",
        resource_url: "/pdfs/DBMS-Module-3 and 4 Notes.pdf"
    },
    {
        title: "Introduction to ER Model & Entity-Relationship Diagrams",
        subject: "DBMS",
        description:
            "Faculty video lecture explaining entities, attributes, cardinality ratios, and ER-to-relational table mapping.",
        resource_url: "https://www.youtube.com/watch?v=gbVev8RuZLg"
    },
    {
        title: "Database Normalization & Anomalies Explained",
        subject: "DBMS",
        description:
            "Video walkthrough of insertion, deletion, and update anomalies and why schema normalization matters in production databases.",
        resource_url: "https://www.youtube.com/watch?v=5GDTIUVlHB8"
    },
    {
        title: "Deadlocks in Operating Systems: Concept & Necessary Conditions",
        subject: "Operating Systems",
        description:
            "Clear conceptual breakdown of mutual exclusion, hold-and-wait, no preemption, and circular wait with real OS scheduling examples.",
        resource_url: "https://www.youtube.com/watch?v=rWFH6PLOIEI"
    },
    {
        title: "Binary Search Trees (BST): Insertion & Deletion Walkthrough",
        subject: "Data Structures",
        description:
            "Visual step-by-step lecture on Binary Search Tree properties, search complexity, node insertion, and deletion cases.",
        resource_url: "https://www.youtube.com/watch?v=cySVml6e_Fc"
    },
    {
        title: "The OSI Reference Model (7 Layers Explained)",
        subject: "Computer Networks",
        description:
            "Structured lecture covering layered network architecture, protocol data units, and responsibilities from Physical to Application layer.",
        resource_url: "https://www.youtube.com/watch?v=qBXmbJZQ5rY"
    }
];

async function seedResources() {
    try {
        // 1. Remove any placeholder example.com entries
        const deleted = await pool.query(
            "DELETE FROM resources WHERE resource_url ILIKE '%example.com%' RETURNING resource_id, title, resource_url"
        );
        console.log(`Removed ${deleted.rowCount} example.com placeholder resource(s).`);

        // 2. Find an existing faculty account
        const facultyResult = await pool.query(
            "SELECT user_id, full_name FROM users WHERE role = 'faculty' ORDER BY user_id ASC LIMIT 1"
        );

        if (facultyResult.rows.length === 0) {
            throw new Error("No faculty user found in users table. Create a faculty account first.");
        }

        const faculty = facultyResult.rows[0];
        console.log(`Seeding resources under faculty: ${faculty.full_name} (ID ${faculty.user_id})`);

        let insertedCount = 0;
        for (const item of SEED_RESOURCES) {
            const existing = await pool.query(
                "SELECT resource_id FROM resources WHERE resource_url = $1",
                [item.resource_url]
            );
            if (existing.rows.length === 0) {
                await pool.query(
                    `INSERT INTO resources (faculty_id, title, description, subject, resource_url)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [faculty.user_id, item.title, item.description, item.subject, item.resource_url]
                );
                insertedCount++;
            }
        }

        console.log(`Inserted ${insertedCount} new resource(s).`);
        const finalResources = await pool.query(
            "SELECT resource_id, title, subject, resource_url FROM resources ORDER BY resource_id ASC"
        );
        console.table(finalResources.rows);
    } finally {
        await pool.end();
    }
}

seedResources().catch((error) => {
    console.error("Resource seeding failed:", error.message);
    process.exit(1);
});
