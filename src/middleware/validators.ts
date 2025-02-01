import { Handler } from "express";
import { body, validationResult } from "express-validator";
import { logger } from "../logging";
import { prettyPrint } from "..";
import { Day } from "../types";

export const locationValidator = () => [body("location").isString().exists()];

export const locationDayValidator = () => [body("location").isString().exists(), body("day").isIn(Object.keys(Day))];

export const locationHoursValidator = () => [body("location").isString().exists(), body("hours").isNumeric().exists()];

export const timeHoursValidator = () => [body("time").isNumeric().exists(), body("hours").isNumeric().optional()];

export const handleValidation: Handler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error("Missing required items in body");
        logger.debug(prettyPrint(errors));
        return res.status(400).send({ msg: "Missing required items in body", ...errors });
    }
    next();
};
