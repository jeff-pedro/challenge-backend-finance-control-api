import { InvalidArgumentError } from "./errorHandler.js";

/*
* Validates if there are records saved in the database with the
* same `month and description` as the request sent.
*/
export default function dataDuplicated(model) {
  return async (req, res, next) => {
    let query;
    const data = req.body;
    const { id } = req.params;

    if (!data) throw new InvalidArgumentError('Empty data fields');

    //  reads when all valid fields are passed to the POST/PUT method
    if (data.description && data.date) {
      const currentDescription = data.description;
      const currentMonth = new Date(data.date).getUTCMonth() + 1;

      query = {
        description: String(currentDescription),
        $expr: {
          $eq: [{ $month: '$date' }, Number(currentMonth)],
        },
      };
      // reads when not all fields are passed to the PUT method
    } else if (!data.description && data.date) {
      const obj = await model.findById(id).exec();
      const currentMonth = new Date(data.date).getUTCMonth() + 1;

      query = {
        description: String(obj.description),
        $expr: {
          $eq: [{ $month: '$date' }, Number(currentMonth)],
        },
      };
    } else if (!data.date && data.description) {
      const obj = await model.findById(id).exec();
      const month = obj.date.getUTCMonth() + 1;
      const currentDescription = data.description;

      query = {
        description: String(currentDescription),
        $expr: {
          $eq: [{ $month: '$date' }, Number(month)],
        },
      };
    } else {
      return next();
    }

    // finds the data given the query passed
    const duplicated = await model.findOne(query).exec();

    // checks if exist duplicated entries
    if (duplicated) {
      res.status(422).json({ errors: { msg: 'This data already exist.' } });
    } else {
      next();
    }
  };
}
