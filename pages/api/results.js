// pages/api/results.js

import {
    auth,
    hget,
    hgetall,
    smembers
} from "@upstash/redis";

const resultsHandler = async (req, res) => {
    // Retrieve data from redis

    auth({
        token: "AYd_ACQgNjc2NTBjY2MtMGEwMS00NDQxLWIxOTEtOTRlOTU2MTdlNzViNDYxZmEyN2Y3M2JjNGQ2NGEyZDdkZjIwYjliZTdjNzc=",
        url: "https://eu1-sweeping-adder-34687.upstash.io",
    });

    try {
        //Find all the entries in the set
        const { data } = await smembers("entries");

        //Get all survey entries by id/key

        //To run multiple queries at once, Upstash supports the use of the pipeline command. This way we can run multiple queries at once and get the results in a single call.
        const response = await fetch(
            "INSERT_YOUR_URL_HERE/pipeline", {
                headers: {
                    Authorization: "Bearer INSERT_YOUR_TOKEN_HERE",
                },
                body: JSON.stringify(data.map((id) => ["HGETALL", id])),
                method: "POST",
            }
        );

        const results = (await response.json()).map((response) => response.result); // e.g. ["rating", "6", "recommendation", "true", "comment", "This is a comment"]

        //Bring the data back to a JSON format
        //Redis returns the data in a list of string (see example above)
        const entries = results.map((r) =>
            r.reduce((acc, curr, i) => {
                if (i % 2 === 0) {
                    const obj = {};
                    obj[curr] = r[i + 1];
                    return { ...acc, ...obj };
                }
                return acc;
            }, [])
        ); //e.g. [{rating: "6", recommendation: "true", comment: "This is a comment"}]

        return res.status(200).json({
            success: true,
            message: "Data retrieved successfully",
            data: entries,
        });
    } catch (error) {
        console.error("Failed to retrieve data from redis", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve data from redis",
        });
    }
};

export default resultsHandler;
