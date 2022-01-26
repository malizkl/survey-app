// pages/api/submit.js

import {
    auth,
    hset,
    sadd
} from "@upstash/redis";

const submitHandler = async (req, res) => {
    const body = req.body;

    // Prepare data to be inserted into the DB
    const data = {
        rating: String(body.rating) || "0",
        recommendation: String(body.recommendation) || "false",
        comment: String(body.comment) || "",
    };

    // Generate a random id to store the survey entry under
    const id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    // Insert data into Upstash redis

    auth({
        token: "AXprACQgODFmNjQyYTctYTU3My00MDU2LTk5YTYtZThjMWRiNmExMTAxZGJhOTE2YzE2MzQyNGFiZTg4MDNkZjAzMTZjNzJkNGU=",
        url: "https://gusc1-dynamic-stingray-31339.upstash.io",
    });

    try {
        //Store the survey data
        await hset(
            `entries:${id}`,

            //RATING
            "rating",
            data.rating,

            //RECOMMENDATION
            "recommendation",
            data.recommendation,

            //COMMENT
            "comment",
            data.comment
        );

        //Store the id of the survey to retrieve it later
        await sadd("entries", `entries:${id}`);
    } catch (error) {
        console.error("Failed to insert data into redis", error);

        return res.status(500).json({
            success: false,
            message: "Failed to insert data into redis",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Data inserted successfully",
    });
};

export default submitHandler;