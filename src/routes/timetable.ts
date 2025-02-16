import express, { Response } from "express";
import TimetableService from "../services/TimetableService";
import { logger } from "../logging";
import { CourseRequest, CourseSection, CustomRequest, Day, Period } from "../types";
import { handleServerError } from "../utils/handleErrors";
import { convertToHuman } from "../utils";
import {
    courseSectionDayValidator,
    handleValidation,
    locationDayValidator,
    locationHoursValidator,
    locationValidator,
    timeHoursValidator,
} from "../middleware/validators";
import { Timetable } from "../db/schema/timetable";

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

timeT.post(
    "/courses-right-now",
    locationValidator(),
    handleValidation,
    (req: CourseRequest, res: Response<Timetable[]>) => {
        const { location } = req.body;

        logger.info(`Getting courses right now for ${location}`);

        TimetableService.CoursesRightNow(location)
            .then(({ status, data }) => {
                return res.status(status).send(data);
            })
            .catch((e) => handleServerError(e, "/timetable/courses-right-now"));
    },
);

timeT.post(
    "/courses-today",
    locationValidator(),
    handleValidation,
    (req: CourseRequest, res: Response<Timetable[]>) => {
        const { location } = req.body;

        logger.info(`Getting courses for today for ${location}`);
        TimetableService.CoursesToday(location)
            .then(({ status, data }) => {
                return res.status(status).send(data);
            })
            .catch((e) => handleServerError(e, "/timetable/courses-today"));
    },
);

timeT.post(
    "/courses-day",
    locationDayValidator(),
    handleValidation,
    (req: CustomRequest<unknown, { location: string; day: Day }>, res: Response<Timetable[]>) => {
        const { location, day } = req.body;
        TimetableService.CoursesDate(location, day)
            .then(({ status, data }) => {
                return res.status(status).send(data);
            })
            .catch((e) => handleServerError(e, "/timetable/courses-day"));
    },
);

timeT.post(
    "/courses-within",
    locationHoursValidator(),
    handleValidation,
    (req: CustomRequest<unknown, { location: string; hours: number }>, res: Response<Timetable[]>) => {
        const { location, hours } = req.body;

        logger.info(`Getting courses for today for ${location}`);
        TimetableService.CoursesWithinNHoursFrom(location, hours)
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

timeT.post(
    "/available-at",
    timeHoursValidator(),
    handleValidation,
    (req: CustomRequest<unknown, { time: number; hours?: number }>, res: Response<string[]>) => {
        const { time, hours } = req.body;
        logger.info(`Checking available at ${convertToHuman(time)}`);
        TimetableService.AvailableAt(time, hours)
            .then(({ status, data }) => res.status(status).send(data))
            .catch((e) => handleServerError(e, "/timetable/available-at"));
    },
);

timeT.post(
    "/common-free-time",
    courseSectionDayValidator(),
    handleValidation,
    (
        req: CustomRequest<unknown, { courseSection: CourseSection[]; day: Day; minDuration?: number }>,
        res: Response<Period[] | { message: string }>,
    ) => {
        const { courseSection, day, minDuration } = req.body;
        TimetableService.FindFreeTime(courseSection, day, minDuration)
            .then(({ status, data }) => {
                if (!data) return res.status(404).send({ message: "Could not find common free time" });
                return res.status(status).send(data);
            })
            .catch((e) => handleServerError(e, "/timetable/common-free-time"));
    },
);

timeT.get("/courses", (req: CustomRequest<unknown, unknown, { day: Day | undefined }>, res) => {
    const { day } = req.query;
    TimetableService.GetAllCourseSections(day)
        .then(({ status, data }) => res.status(status).send(data))
        .catch((e) => handleServerError(e, "/timetable/courses"));
});

export default timeT;
