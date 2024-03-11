import express from "express";
import TimetableService from "../services/TimetableService";
import { logger } from "../logging";
import { CourseRequest, CustomRequest } from "../types";
import { handleServerError } from "../utils/handleErrors";

const timeT = express.Router();

timeT.get("/info", (req, res) => {
    res.send("Timetable route");
});

timeT.get("/locations", (req, res) => {
    TimetableService.GetAllLocations()
        .then(({ status, data }) => {
            return res.status(status).send(data);
        })
        .catch((e) => handleServerError(e, "/timetable/locations"));
});

timeT.post("/courses-right-now", (req: CourseRequest, res) => {
    const { location } = req.body;

    logger.info(`Getting courses right now for ${location}`);

    TimetableService.CoursesRightNow(location)
        .then(({ status, data }) => {
            return res.status(status).send(data);
        })
        .catch((e) => handleServerError(e, "/timetable/courses-right-now"));
});

timeT.post("/courses-today", (req: CourseRequest, res) => {
    const { location } = req.body;

    logger.info(`Getting courses for today for ${location}`);
    TimetableService.CoursesToday(location)
        .then(({ status, data }) => {
            return res.status(status).send(data);
        })
        .catch((e) => handleServerError(e, "/timetable/courses-today"));
});

timeT.post(
    "/courses-within",
    (req: CustomRequest<unknown, { location: string; hours: number }>, res) => {
        const { location, hours } = req.body;

        logger.info(`Getting courses for today for ${location}`);
        TimetableService.CoursesWithinNHours(location, hours)
            .then(({ status, data }) => {
                return res.status(status).send(data);
            })
            .catch((e) => handleServerError(e, "/timetable/courses-within"));
    },
);

timeT.get("/available-right-now", (req, res) => {
    TimetableService.AvailableRightNow()
        .then(({ status, data }) => {
            return res.status(status).send(data);
        })
        .catch((e) => handleServerError(e, "/timetable/available-right-now"));
});

export default timeT;
