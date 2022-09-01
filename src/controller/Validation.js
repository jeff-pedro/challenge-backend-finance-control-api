export default class Validation {

    static async isDuplicated(data, model, id) {

        let query;

        if (data.description && data.date) {
            
            let currentDescription = data.description;
            let currentMonth = new Date(data.date).getUTCMonth() + 1;
            query = {
                description: String(currentDescription),
                $expr: {
                    $eq: [{ $month: "$date" }, Number(currentMonth)]
                }
            }
        } else if (!data.description && data.date) {
            
            let obj = await model.findById(id).exec();
            let currentMonth = new Date(data.date).getUTCMonth() + 1;
            query = {
                description: String(obj.description),
                $expr: {
                    $eq: [{ $month: "$date" }, Number(currentMonth)]
                }
            }
        } else if (!data.date && data.description) {
            
            let obj = await model.findById(id).exec();
            let month = obj.date.getUTCMonth() + 1;
            let currentDescription = data.description;
            query = {
                description: String(currentDescription),
                $expr: {
                    $eq: [{ $month: "$date" }, Number(month)]
                }
            }
        } else {
            return false;
        }

       let res = await model.findOne(query).exec();

       // check if exists duplicated entries
        if (res) {
            return true;
        } else {
            return false;
        }
    }

    static async isValidCategory(data) {

                // valid categories
                const categoryList = [
                    'Alimentação',
                    'Saúde',
                    'Moradia',
                    'Transporte',
                    'Educação',
                    'Lazer',
                    'Imprevistos',
                    'Outras'
                ]
                
                // checks if the category field is empty
                if (!data.category) {
                    return  { value: true };     
                }

                // checks if an valid category was passed              
                if (categoryList.includes(data.category)) {
                        return { value: true };
                } else {
                        return {
                            value: false, 
                            list: categoryList
                        };
                }
    }

}
