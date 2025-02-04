import { Handler } from "express";
import { body, validationResult } from "express-validator";
import { logger } from "../logging";
import { prettyPrint } from "..";
import { Day } from "../types";

const locationChain = () => body("location").isString();
const dayChain = () => body("day").isIn(Object.keys(Day));
const durationChain = () => body("minDuration").isNumeric();
const hoursChain = () => body("hours").isNumeric();
const timeChain = () => body("time").isNumeric();
const courseSectionChain = () => [
    (() => body("courseSection", "courseSection must exist and have at least 2 items").exists().isArray({ min: 2 }))(),
    (() => body("courseSection.*.course", "course must exist in courseSection").isString().exists())(),
    (() => body("courseSection.*.section", "section must exist in courseSection").isString().exists())(),
];

export const locationValidator = () => [locationChain().exists()];

export const locationDayValidator = () => [locationChain().exists(), dayChain().exists()];

export const locationHoursValidator = () => [locationChain().exists(), hoursChain().exists()];

export const timeHoursValidator = () => [timeChain().exists(), hoursChain().optional()];

export const courseSectionDayValidator = () => [...courseSectionChain(), dayChain(), durationChain().optional()];

export const handleValidation: Handler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error("Missing required items in body");
        logger.debug(prettyPrint(errors));
        return res.status(422).send({ msg: "Missing required items in body", ...errors });
    }
    next();
};
